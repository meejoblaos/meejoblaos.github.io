/* MEEJOB — sample job listings
 *
 * These are example postings so the board is not empty on a fresh install.
 * Replace or delete them once real jobs are in the `jobs` table
 * (see supabase/meejob.sql). Each card is labelled "Sample" in the UI.
 */
window.MEEJOB_JOBS = [
  {
    id: "sample-web-developer",
    sample: true,
    job_type: "full_time",
    category: "web-design",
    title_lo: "ນັກພັດທະນາເວັບ",
    title_en: "Web Developer",
    company_lo: "ບໍລິສັດ ດີຈິຕອນລາວ",
    company_en: "Digital Lao Co., Ltd.",
    location_lo: "ນະຄອນຫຼວງວຽງຈັນ",
    location_en: "Vientiane",
    salary: "8,000,000 – 12,000,000 LAK",
    description_lo:
      "ຮັບຜິດຊອບພັດທະນາເວັບໄຊທ໌ຂອງລູກຄ້າ, ແກ້ໄຂບັນຫາໜ້າເວັບ ແລະ ຮ່ວມງານກັບທີມອອກແບບ. ຕ້ອງການຄວາມຮູ້ HTML, CSS, JavaScript ແລະ React.",
    description_en:
      "Build and maintain client websites, fix front-end issues and work with the design team. Requires HTML, CSS, JavaScript and React.",
    contact: "hr@digital-lao.example"
  },
  {
    id: "sample-app-developer",
    sample: true,
    job_type: "full_time",
    category: "app",
    title_lo: "ນັກພັດທະນາແອັບມືຖື",
    title_en: "Mobile App Developer",
    company_lo: "ສະຕາດອັບ ເຕັກໂນໂລຢີ",
    company_en: "Startup Tech Laos",
    location_lo: "ນະຄອນຫຼວງວຽງຈັນ",
    location_en: "Vientiane",
    salary: "10,000,000 – 15,000,000 LAK",
    description_lo:
      "ພັດທະນາແອັບ iOS ແລະ Android ດ້ວຍ Flutter. ມີປະສົບການຢ່າງໜ້ອຍ 1 ປີ ແລະ ສາມາດເຮັດວຽກເປັນທີມໄດ້.",
    description_en:
      "Develop iOS and Android apps with Flutter. At least one year of experience and comfortable working in a team.",
    contact: "jobs@startup-tech.example"
  },
  {
    id: "sample-graphic-designer",
    sample: true,
    job_type: "part_time",
    category: "graphics",
    title_lo: "ນັກອອກແບບກຣາຟິກ",
    title_en: "Graphic Designer",
    company_lo: "ຮ້ານກາເຟ ດອກຈຳປາ",
    company_en: "Dok Champa Café",
    location_lo: "ຫຼວງພະບາງ",
    location_en: "Luang Prabang",
    salary: "3,000,000 – 4,500,000 LAK",
    description_lo:
      "ອອກແບບໂລໂກ້, ເມນູ, ໂປສເຕີ ແລະ ເນື້ອຫາໂຊຊຽລ. ເຮັດວຽກ 3 ວັນຕໍ່ອາທິດ, ໃຊ້ Canva ຫຼື Photoshop ໄດ້.",
    description_en:
      "Design logos, menus, posters and social posts. Three days a week; comfortable with Canva or Photoshop.",
    contact: "020 5555 1234"
  },
  {
    id: "sample-site-engineer",
    sample: true,
    job_type: "full_time",
    category: "engineering",
    title_lo: "ວິສະວະກອນກໍ່ສ້າງ",
    title_en: "Site Engineer",
    company_lo: "ບໍລິສັດ ກໍ່ສ້າງ ສະຫວັນ",
    company_en: "Savann Construction",
    location_lo: "ແຂວງສະຫວັນນະເຂດ",
    location_en: "Savannakhet",
    salary: "9,000,000 – 14,000,000 LAK",
    description_lo:
      "ຄຸມງານການກໍ່ສ້າງ, ກວດສອບແບບ ແລະ ຄວບຄຸມຄຸນນະພາບງານ. ຈົບປະລິນຍາດ້ານວິສະວະກຳໂຍທາ ຫຼື ສາຂາທີ່ກ່ຽວຂ້ອງ.",
    description_en:
      "Supervise construction work, review drawings and control quality. Degree in civil engineering or a related field.",
    contact: "hr@savann-construction.example"
  },
  {
    id: "sample-content-writer",
    sample: true,
    job_type: "short_term",
    category: "content",
    title_lo: "ນັກຂຽນເນື້ອຫາ",
    title_en: "Content Writer",
    company_lo: "ທີມການຕະຫຼາດ MEEJOB",
    company_en: "MEEJOB Marketing Team",
    location_lo: "ອອນລາຍ / ເຮັດວຽກຈາກເຮືອນ",
    location_en: "Remote",
    salary: "1,500,000 LAK / ໂຄງການ",
    description_lo:
      "ຂຽນບົດຄວາມສັ້ນ 10 ບົດກ່ຽວກັບການຊອກວຽກ ແລະ ການເຮັດວຽກອອນລາຍ. ສົ່ງຕົວຢ່າງຜົນງານມາດ້ວຍ.",
    description_en:
      "Write 10 short articles about job hunting and remote work. Please include writing samples.",
    contact: "hello@meejob.example"
  },
  {
    id: "sample-marketing-assistant",
    sample: true,
    job_type: "part_time",
    category: "marketing",
    title_lo: "ຜູ້ຊ່ວຍການຕະຫຼາດ",
    title_en: "Marketing Assistant",
    company_lo: "ບໍລິສັດ ລາວຄອນເນັກ",
    company_en: "Lao Connect Co., Ltd.",
    location_lo: "ນະຄອນຫຼວງວຽງຈັນ",
    location_en: "Vientiane",
    salary: "2,500,000 – 3,500,000 LAK",
    description_lo:
      "ດູແລໜ້າເພຈ Facebook, ຕອບຂໍ້ຄວາມ ແລະ ຊ່ວຍວາງແຜນໂຄສະນາ. ເໝາະສຳລັບນັກສຶກສາ ຫຼື ຄົນທີ່ຫາການເຮັດວຽກເສີມ.",
    description_en:
      "Manage a Facebook page, reply to messages and help plan ads. Great for students or anyone looking for extra work.",
    contact: "020 7777 8899"
  }
];
