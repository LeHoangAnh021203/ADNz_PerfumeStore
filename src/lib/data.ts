export interface Project {
  id: string;
  title: string;
  clipCount: number;
  createdAt: string;
  updatedAt?: string;
  images: string[];
  isGenerating?: boolean;
  progress?: number;
  eta?: string;
  isFailed?: boolean;
}

// You can paste any public image URL (http/https) into `images`.
export const projects: Project[] = [
  {
    id: "1",
    title: "DESIGNER",
    clipCount: 14,
    createdAt: "2024-10-20",
    updatedAt: "2026-04-14T03:40:00.000Z",
    images: [
      "https://i.pinimg.com/1200x/bd/af/29/bdaf29a764bd9bac30d1765927c089ed.jpg",
      "https://i.pinimg.com/1200x/ec/b9/2f/ecb92f25be1365fc6ed19e4630311bb4.jpg",
      "https://i.pinimg.com/736x/67/2b/4b/672b4b0cfc988839cab57ca4fb5a2676.jpg",
      "https://i.pinimg.com/1200x/92/65/e9/9265e98420fe72c8c85b9a13b7b389c3.jpg",
      "https://i.pinimg.com/1200x/33/db/da/33dbda0c8b170b05dc497fb6de9c5c22.jpg",
    ],
  },
  {
    id: "2",
    title: "DESIGNER LUXURY",
    clipCount: 6,
    createdAt: "2024-11-15",
    updatedAt: "2026-04-13T03:40:00.000Z",
    images: [
      "https://i.pinimg.com/736x/23/d4/7b/23d47b87707b8a324d860320e8910983.jpg",
      "https://i.pinimg.com/736x/88/96/22/8896224093ab99d2ea6092d6e3dfdd3d.jpg",
      "https://i.pinimg.com/736x/8e/5c/4a/8e5c4adf59f08a1819bda7375af90fdb.jpg",
      "https://i.pinimg.com/736x/72/ed/3d/72ed3deea687d0a89f46f956f75a5846.jpg",
      "https://i.pinimg.com/736x/8e/98/d2/8e98d27ca351b289ec55fee9c4464afc.jpg",
    ],
  },
  {
    id: "3",
    title: "INDIE",
    clipCount: 5,
    createdAt: "2024-11-25",
    updatedAt: "2026-04-11T22:40:00.000Z",
    images: [
      "https://i.pinimg.com/1200x/ad/26/53/ad2653186ee134c52659fd297162ceb8.jpg",
      "https://i.pinimg.com/1200x/24/af/a0/24afa0f65a642a594dde7cdcb034b31a.jpg",
      "https://i.pinimg.com/1200x/25/09/30/250930cf5c56e410a6f810a03562f857.jpg",
      "https://i.pinimg.com/1200x/23/00/99/230099db4b62f5af258a580f347c26bf.jpg",
      "https://i.pinimg.com/736x/f2/13/7d/f2137d0cb07ae43ad08dd60683913d33.jpg",
    ],
  },
  {
    id: "4",
    title: "MIDDLE EAST",
    clipCount: 8,
    createdAt: "2024-10-25",
    updatedAt: "2026-04-10T18:40:00.000Z",
    images: [
      "https://i.pinimg.com/736x/8d/67/d7/8d67d7ddcc16292b6c9b5f453024d657.jpg",
      "https://i.pinimg.com/736x/83/04/52/83045203b9ce70132bcc67ae047c44aa.jpg",
      "https://i.pinimg.com/1200x/3f/08/c9/3f08c98f5a494cf2068d738e7ee2d654.jpg",
      "https://i.pinimg.com/736x/1d/02/38/1d023807a2dedc30c95878247fa60a77.jpg",
      "https://i.pinimg.com/1200x/26/43/60/264360741ecf5dce8c836ca55ba7de13.jpg",
    ],
  },
  {
    id: "5",
    title: "NICHE",
    clipCount: 8,
    createdAt: "2024-11-20",
    updatedAt: "2026-04-09T17:40:00.000Z",
    images: [
      "https://i.pinimg.com/1200x/e3/6f/cb/e36fcbbde388f47ab62c9a123d61c67c.jpg",
      "https://i.pinimg.com/1200x/ed/13/38/ed13386a779543d0423ed0a4f05f1b1a.jpg",
      "https://i.pinimg.com/1200x/0e/06/fa/0e06faf0dfdbfdce6a18832e85bd8c16.jpg",
      "https://i.pinimg.com/736x/e1/b7/64/e1b7644fdb8f1a9e42fdccb2c4aa7e8d.jpg",
      "https://i.pinimg.com/1200x/a4/99/bd/a499bd68ad835e30ea183372ac64ad18.jpg",
    ],
  },

  {
    id: "6",
    title: "NICHE LUXURY",
    clipCount: 8,
    createdAt: "2024-11-20",
    updatedAt: "2026-04-08T17:40:00.000Z",
    images: [
      "https://i.pinimg.com/1200x/4b/e9/a6/4be9a6688f44bd8ce1b5c97416ae2abb.jpg",
      "https://i.pinimg.com/736x/fb/58/00/fb580003db1a07c52c51b1281b1126f9.jpg",
      "https://i.pinimg.com/736x/ae/79/54/ae7954bae910d1ab089b5bee2edb1f95.jpg",
      "https://i.pinimg.com/736x/23/32/23/2332234961991ec268c716d89273c716.jpg",
      "https://i.pinimg.com/1200x/e4/66/d9/e466d91eb37243b8420c7f545822de48.jpg",
    ],
  },

  {
    id: "7",
    title: "TESTER/REFILL/SHOWCASE",
    clipCount: 8,
    createdAt: "2024-11-20",
    updatedAt: "2026-04-08T17:40:00.000Z",
    images: [
      "https://i.pinimg.com/1200x/55/a4/1a/55a41a4cdcef534970a1a33f10a20cd9.jpg",
      "https://i.pinimg.com/736x/51/0a/d9/510ad9816fa76f578d27dd6f6520a177.jpg",
      "https://i.pinimg.com/736x/25/6b/02/256b02dc870e1f3a4665dfb54a61a262.jpg",
      "https://i.pinimg.com/736x/2b/9b/71/2b9b718d14b878b48d40131c3e61dbe9.jpg",
      "https://i.pinimg.com/736x/cb/5d/51/cb5d5154df16558919f68fa5646994ff.jpg",
    ],
  },

  {
    id: "8",
    title: "Software Support",
    clipCount: 8,
    createdAt: "2024-11-20",
    updatedAt: "2026-04-08T17:40:00.000Z",
    images: [
      "https://i.pinimg.com/originals/4c/27/7e/4c277e81f6fa23aec2a198d848d3ef6c.gif",
      "/video/software.mp4",
      "https://i.pinimg.com/originals/98/89/e3/9889e39bdf05bd42c0aa7940228b5e71.gif",
      "https://i.pinimg.com/736x/1b/d9/5e/1bd95e13ad4fb331d42dc40363973e0c.jpg",
      "https://i.pinimg.com/736x/ed/c8/75/edc875bb92bda5e9dee75a2b3b601710.jpg",
    ],
  },
];
