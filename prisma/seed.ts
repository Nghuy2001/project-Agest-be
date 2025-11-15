import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const cities = [
    { name: "Hà Nội" },
    { name: "Hồ Chí Minh" },
    { name: "Hải Phòng" },
    { name: "Đà Nẵng" },
    { name: "Cần Thơ" },
    { name: "Quảng Ninh" },
    { name: "Hải Dương" },
    { name: "Hưng Yên" },
    { name: "Bắc Ninh" },
    { name: "Vĩnh Phúc" },
    { name: "Bắc Giang" },
    { name: "Thái Nguyên" },
    { name: "Thanh Hóa" },
    { name: "Nghệ An" },
    { name: "Hà Tĩnh" },
    { name: "Quảng Bình" },
    { name: "Quảng Trị" },
    { name: "Thừa Thiên Huế" },
    { name: "Quảng Nam" },
    { name: "Quảng Ngãi" },
    { name: "Bình Định" },
    { name: "Phú Yên" },
    { name: "Khánh Hòa" },
    { name: "Ninh Thuận" },
    { name: "Bình Thuận" },
    { name: "Kon Tum" },
    { name: "Gia Lai" },
    { name: "Đắk Lắk" },
    { name: "Đắk Nông" },
    { name: "Lâm Đồng" },
    { name: "Bình Dương" },
    { name: "Đồng Nai" },
    { name: "Bà Rịa - Vũng Tàu" },
  ];

  await prisma.city.createMany({
    data: cities,
    skipDuplicates: true,
  });

  console.log("✔ Seed 34 tỉnh/thành công.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
