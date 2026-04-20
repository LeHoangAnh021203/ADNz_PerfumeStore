import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import path from "node:path";
import { getMongoDb } from "@/lib/mongodb";
import {
  normalizeAndValidateEmail,
  normalizeAndValidateLinks,
  normalizeAndValidatePhone,
} from "@/lib/wholesale-validation";

export const dynamic = "force-dynamic";

type SignupPayload = {
  zaloPhone?: string;
  customerEmail?: string;
  pageLinks?: string[];
};

type LinkItem = {
  platform: string;
  normalizedUrl: string;
};

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return request.headers.get("x-real-ip") || null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendEmailViaSmtp({
  from,
  to,
  subject,
  html,
  attachments,
}: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string; cid?: string }>;
}) {
  const host = process.env.EMAIL_HOST;
  const portRaw = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const passRaw = process.env.EMAIL_PASSWORD;

  if (!host || !portRaw || !user || !passRaw) {
    return { attempted: false as const, sent: false as const, reason: "missing_smtp_env" };
  }
  const pass = passRaw.replace(/\s+/g, "");

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    return { attempted: false as const, sent: false as const, reason: "invalid_smtp_port" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: to.join(", "),
    subject,
    html,
    attachments,
  });

  return { attempted: true as const, sent: true as const, reason: null };
}

async function sendWholesaleSignupEmails({
  phoneLocal,
  phoneE164,
  customerEmail,
  links,
  submittedAt,
}: {
  phoneLocal: string;
  phoneE164: string;
  customerEmail: string;
  links: LinkItem[];
  submittedAt: Date;
}) {
  const fromEmail = process.env.WHOLESALE_NOTIFY_EMAIL_FROM || process.env.EMAIL_USER;
  const toEmail = process.env.WHOLESALE_NOTIFY_EMAIL_TO;

  if (!fromEmail || !toEmail) {
    return {
      admin: { attempted: false as const, sent: false as const, reason: "missing_notify_env" },
      customer: { attempted: false as const, sent: false as const, reason: "missing_notify_env" },
    };
  }

  const linksHtml =
    links.length === 0
      ? "<li>(Không có link)</li>"
      : links
          .map(
            (link) =>
              `<li><strong>${escapeHtml(link.platform.toUpperCase())}</strong>: <a href="${escapeHtml(
                link.normalizedUrl
              )}" target="_blank" rel="noreferrer">${escapeHtml(link.normalizedUrl)}</a></li>`
          )
          .join("");
  const admin = await sendEmailViaSmtp({
    from: fromEmail,
    to: [toEmail],
    subject: "ADNz | Đăng ký CTV/Sỉ mới",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 8px">Có đăng ký CTV/Sỉ mới</h2>
        <p style="margin:0 0 16px;color:#555">Thời gian: ${submittedAt.toLocaleString("vi-VN")}</p>
        <p><strong>SĐT Zalo:</strong> ${escapeHtml(phoneLocal)} (${escapeHtml(phoneE164)})</p>
        <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
        <p><strong>Link bán hàng:</strong></p>
        <ul>${linksHtml}</ul>
      </div>
    `,
  });

  const customer = await sendEmailViaSmtp({
    from: fromEmail,
    to: [customerEmail],
    subject: "ADNz | Xác nhận đăng ký CTV/Sỉ",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 8px">ADNz đã nhận đăng ký của bạn</h2>
        <p style="margin:0 0 16px;color:#555">Thời gian: ${submittedAt.toLocaleString("vi-VN")}</p>
        <p>Cảm ơn bạn đã đăng ký CTV/Sỉ cùng ADNz Perfume.</p>
        <p><strong>SĐT Zalo:</strong> ${escapeHtml(phoneLocal)}</p>
        <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
        <p><strong>Nhóm zalo CTV/Sỉ nhà ADNz:</strong></p>
        <p style="margin:8px 0 16px;">
          <img src="cid:adnz-zalo-qr" alt="QR Nhóm zalo CTV/Sỉ nhà ADNz" style="max-width:240px;width:100%;height:auto;border-radius:8px;" />
        </p>
        <p>Đội ngũ ADNz sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
      </div>
    `,
    attachments: [
      {
        filename: "QR.jpg",
        path: path.join(process.cwd(), "public", "logo", "QR.jpg"),
        cid: "adnz-zalo-qr",
      },
    ],
  });

  return { admin, customer };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SignupPayload;
    const phoneResult = normalizeAndValidatePhone(body.zaloPhone ?? "");
    const emailResult = normalizeAndValidateEmail(body.customerEmail ?? "");
    const linksResult = normalizeAndValidateLinks(Array.isArray(body.pageLinks) ? body.pageLinks : []);

    if (!phoneResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: phoneResult.error,
        },
        { status: 400 }
      );
    }

    if (!linksResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: linksResult.errors[0] ?? "Danh sách link chưa hợp lệ.",
          errors: linksResult.errors,
        },
        { status: 400 }
      );
    }

    if (!emailResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: emailResult.error,
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const db = await getMongoDb();
    const signups = db.collection("wholesale_signups");
    const signupDoc = {
      zaloPhoneLocal: phoneResult.local,
      zaloPhoneE164: phoneResult.e164,
      customerEmail: emailResult.value,
      links: linksResult.links,
      submittedAt: now,
      meta: {
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent") || null,
        country:
          request.headers.get("x-vercel-ip-country") ||
          request.headers.get("cf-ipcountry") ||
          null,
      },
      notification: {
        admin: {
          attemptedAt: null as Date | null,
          sentAt: null as Date | null,
          sent: false,
          reason: null as string | null,
        },
        customer: {
          attemptedAt: null as Date | null,
          sentAt: null as Date | null,
          sent: false,
          reason: null as string | null,
        },
      },
    };

    const insertResult = await signups.insertOne(signupDoc);

    try {
      const emailResults = await sendWholesaleSignupEmails({
        phoneLocal: phoneResult.local,
        phoneE164: phoneResult.e164,
        customerEmail: emailResult.value,
        links: linksResult.links,
        submittedAt: now,
      });

      await signups.updateOne(
        { _id: insertResult.insertedId },
        {
          $set: {
            "notification.admin.attemptedAt": new Date(),
            "notification.admin.sentAt": emailResults.admin.sent ? new Date() : null,
            "notification.admin.sent": emailResults.admin.sent,
            "notification.admin.reason": emailResults.admin.reason,
            "notification.customer.attemptedAt": new Date(),
            "notification.customer.sentAt": emailResults.customer.sent ? new Date() : null,
            "notification.customer.sent": emailResults.customer.sent,
            "notification.customer.reason": emailResults.customer.reason,
          },
        }
      );
    } catch (emailError) {
      console.error("Failed to send wholesale signup email", emailError);
      await signups.updateOne(
        { _id: insertResult.insertedId },
        {
          $set: {
            "notification.admin.attemptedAt": new Date(),
            "notification.admin.sentAt": null,
            "notification.admin.sent": false,
            "notification.admin.reason": "email_send_failed",
            "notification.customer.attemptedAt": new Date(),
            "notification.customer.sentAt": null,
            "notification.customer.sent": false,
            "notification.customer.reason": "email_send_failed",
          },
        }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Đăng ký thành công. ADNz sẽ liên hệ với bạn sớm nhất có thể.",
    });
  } catch (error) {
    console.error("Failed to handle wholesale signup", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Hệ thống đang bận. Vui lòng thử lại sau ít phút.",
      },
      { status: 500 }
    );
  }
}
