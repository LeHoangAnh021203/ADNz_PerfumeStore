import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info } from "lucide-react"

const faqs = [
    {
        question: "Hành trình tự kiểm chứng mùi hương — Vì sao có mùi hợp ngay, có mùi lại không?",
        answer:
            "Mỗi mùi hương sẽ lên da khác nhau do nhiệt độ cơ thể, pH da, khí hậu, và cả thói quen sinh hoạt hằng ngày. Vì vậy cùng một chai nước hoa nhưng người này thấy rất hợp, người khác lại thấy chưa đúng gu. Cách chọn hiệu quả nhất là test trên da thật, đợi 30-60 phút để mùi ổn định rồi mới quyết định. ADNz có thể gợi ý theo nhóm mùi, môi trường sử dụng và ngân sách để bạn chọn đúng ngay từ đầu.",
    },
    {
        question: "ADNz có bán hàng chính hãng không?",
        answer:
            "ADNz tập trung các dòng nước hoa chính hãng, được kiểm tra kỹ càng trước khi được gửi đến tay khách hàng. Nếu cần tư vấn mùi theo ngân sách hoặc phong cách, đội ngũ sẽ hỗ trợ trực tiếp.",
    },
    {
        question: "Mình muốn đăng ký CTV/Sỉ thì làm sao?",
        answer:
            "Bạn bấm vào nút “Wholesale & Reseller”, điền SĐT Zalo + email + link kênh bán hàng. Hệ thống sẽ gửi xác nhận tự động và ADNz sẽ liên hệ lại để duyệt hồ sơ hợp tác.",
    },
    {
        question: "Bao lâu mình nhận được phản hồi sau khi đăng ký?",
        answer:
            "Thông thường trong ngày làm việc. Trường hợp đăng ký ngoài giờ cao điểm, đội ngũ sẽ phản hồi vào khung giờ làm việc gần nhất qua Zalo hoặc email bạn đã để lại.",
    },
    {
        question: "Có hỗ trợ ship toàn quốc không?",
        answer:
            "Có. ADNz hỗ trợ giao hàng toàn quốc. Thời gian nhận hàng tùy khu vực và đơn vị vận chuyển, bạn sẽ được báo dự kiến giao hàng trước khi chốt đơn.",
    },
    {
        question: "Có được đổi mùi hoặc hỗ trợ sau mua không?",
        answer:
            "ADNz có hỗ trợ sau mua theo tình trạng sản phẩm và chính sách từng thời điểm. Bạn nên liên hệ sớm qua kênh chăm sóc để được xử lý nhanh nhất.",
    },
    {
        question: "Liên hệ nhanh với ADNz bằng cách nào?",
        answer:
            "Bạn có thể nhắn trực tiếp qua Facebook/Zalo của ADNz hoặc hotline 0342 988 398. Với khách CTV/Sỉ, nên để lại đầy đủ thông tin trong form để được ưu tiên tư vấn.",
    },
]

export function FAQSection() {
    return (
        <section id="faq" className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ADA996] to-[#F2F2F2] rounded-full mb-6">
                        <Info className="w-4 h-4 text-black" />
                        <span className="text-xs text-black uppercase tracking-widest">FAQ</span>
                    </div>
                    <h2 className="font-sans text-5xl font-normal mb-6 text-balance">Câu hỏi thường gặp</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Tất cả thông tin quan trọng về mua hàng, đăng ký CTV/Sỉ và chính sách hỗ trợ của ADNz Perfume.
                    </p>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-foreground/30"
                        >
                            <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}
