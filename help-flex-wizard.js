const DEFAULT_LOGO_URL =
  process.env.MISBAHUL_AITAM_LOGO_URL ||
  "https://img1.pic.in.th/images/Logo223376766a03d608d.png";

const COLORS = {
  brand: "#0b7c86",
  brandDark: "#0a5f67",
  brandSoft: "#e8f7f8",
  text: "#102a43",
  muted: "#5f6c7b",
  border: "#c9d6df",
  danger: "#ff1a12",
  dangerSoft: "#ffe9e7",
  cardSoft: "#efefef",
  white: "#ffffff",
  progressOn: "#d9b11f",
  progressOff: "#d7e2e5",
  success: "#118a61"
};

const WIZARD_CONTROL_COMMANDS = new Set([
  "พิมพ์ข้อมูลต่อ",
  "พิมพ์ข้อมูลในช่องแชท",
  "ถัดไป",
  "พร้อมกรอกข้อมูล",
  "ยกเลิก",
  "ยกเลิกฟอร์ม",
  "กลับสู่เมนูหลักขอความช่วยเหลือ",
  "กลับสู่เมนูหลัก",
  "ส่งข้อมูล",
  "ส่งข้อมูล / sent",
  "แก้ไขข้อมูล",
  "sent"
]);

const STEP_META = {
  name: {
    order: 1,
    title: "พิมพ์ชื่อและนามสกุล",
    example: "ตัวอย่าง: นายสมชาย ใจดี",
    helper: "กรุณาพิมพ์ข้อมูลตามคำสั่งด้านล่าง"
  },
  location: {
    order: 2,
    title: "พิมพ์สถานที่ / พื้นที่เกิดเหตุ",
    example: "ตัวอย่าง: 79 ต.ละงู อ.เมือง จ.สตูล",
    helper: "กรุณาพิมพ์ข้อมูลตามคำสั่งด้านล่าง"
  },
  problem: {
    order: 3,
    title: "พิมพ์รายละเอียดที่ต้องการความช่วยเหลือ",
    example: "ตัวอย่าง: ต้องการทุนในการศึกษาต่อ",
    helper: "กรุณาพิมพ์ข้อมูลตามคำสั่งด้านล่าง"
  },
  phone: {
    order: 4,
    title: "พิมพ์หมายเลขโทรศัพท์",
    example: "ตัวอย่าง: 0935826662",
    helper: "กรุณาพิมพ์ข้อมูลตามคำสั่งด้านล่าง"
  },
  confirm: {
    order: 5,
    title: "กรุณาตรวจสอบความถูกต้องของข้อมูล",
    example: "หากข้อมูลถูกต้องให้กดส่งข้อมูล",
    helper: "ตรวจสอบข้อมูลก่อนส่งเข้าสู่ระบบ"
  }
};

function cleanText(value) {
  return String(value ?? "").replace(/\r/g, "").trim();
}

function sanitizeHelpWizardInput(value = "") {
  return cleanText(value)
    .replace(/\u200b/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function isWizardControlCommand(value = "") {
  return WIZARD_CONTROL_COMMANDS.has(cleanText(value).toLowerCase());
}

function normalizePhoneInput(value = "") {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.startsWith("0066") && digits.length >= 13) {
    digits = `0${digits.slice(4)}`;
  }
  return digits;
}

function isValidPhoneInput(value = "") {
  const digits = normalizePhoneInput(value);
  return /^0\d{8,9}$/.test(digits);
}

function looksLikeAddressOnly(value = "") {
  const text = cleanText(value);
  const hasAddressHint = /(ต\.|ตำบล|อ\.|อำเภอ|จ\.|จังหวัด|หมู่|ม\.|ซอย|ถนน)/.test(text);
  const hasNeedHint = /(ต้องการ|ขอ|ช่วย|ทุน|อาหาร|ยา|ค่ารักษา|ที่พัก|ซ่อม|เรียน|ศึกษา)/.test(text);
  return hasAddressHint && !hasNeedHint;
}

function validateHelpWizardField(step = "", value = "", data = {}) {
  const text = sanitizeHelpWizardInput(value);

  if (!text) {
    return { ok: false, message: "กรุณาพิมพ์ข้อมูลจริงในช่องแชทด้านล่าง", value: "" };
  }

  if (isWizardControlCommand(text)) {
    return { ok: false, message: "กรุณาพิมพ์ข้อมูลจริงในช่องแชทด้านล่าง", value: "" };
  }

  if (step === "name") {
    if (text.length < 3) {
      return { ok: false, message: "กรุณากรอกชื่อและนามสกุลให้ชัดเจน", value: text };
    }
    if (/^\d+$/.test(text)) {
      return { ok: false, message: "ชื่อไม่ควรเป็นตัวเลขล้วน", value: text };
    }
    return { ok: true, value: text };
  }

  if (step === "location") {
    if (text.length < 5) {
      return { ok: false, message: "กรุณากรอกสถานที่ให้ละเอียดมากขึ้น", value: text };
    }
    if (/พร้อมกรอกข้อมูล/i.test(text)) {
      return { ok: false, message: "กรุณากรอกสถานที่จริง เช่น ตำบล อำเภอ จังหวัด", value: text };
    }
    return { ok: true, value: text };
  }

  if (step === "problem") {
    if (text.length < 10) {
      return { ok: false, message: "กรุณากรอกรายละเอียดปัญหาให้มากขึ้น", value: text };
    }
    if (/พร้อมกรอกข้อมูล/i.test(text)) {
      return { ok: false, message: "กรุณากรอกรายละเอียดปัญหาที่ต้องการความช่วยเหลือ", value: text };
    }
    if (looksLikeAddressOnly(text)) {
      return { ok: false, message: "รายละเอียดควรเป็นปัญหาที่ต้องการความช่วยเหลือ ไม่ใช่เฉพาะที่อยู่", value: text };
    }
    return { ok: true, value: text };
  }

  if (step === "phone") {
    const phone = normalizePhoneInput(text);
    if (!isValidPhoneInput(phone)) {
      return { ok: false, message: "กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 0812345678", value: phone };
    }
    return { ok: true, value: phone };
  }

  if (step === "confirm") {
    return { ok: true, value: text };
  }

  return { ok: false, message: "ไม่พบขั้นตอนการกรอกข้อมูล", value: text };
}

function progressBar(stepOrder = 1) {
  const items = [];
  for (let i = 1; i <= 5; i += 1) {
    items.push({
      type: "box",
      layout: "vertical",
      flex: 1,
      height: "10px",
      cornerRadius: "999px",
      backgroundColor: i <= stepOrder ? COLORS.progressOn : COLORS.progressOff,
      contents: []
    });
  }
  return items;
}

function buildBrandHeader(stepKey = "name") {
  const meta = STEP_META[stepKey] || STEP_META.name;
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: COLORS.brand,
    paddingAll: "18px",
    spacing: "md",
    contents: [
      {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          {
            type: "image",
            url: DEFAULT_LOGO_URL,
            size: "xxs",
            aspectMode: "cover",
            aspectRatio: "1:1",
            flex: 0,
            backgroundColor: COLORS.white,
            cornerRadius: "999px"
          },
          {
            type: "box",
            layout: "vertical",
            flex: 1,
            contents: [
              {
                type: "text",
                text: "Misbahul Aitam",
                color: COLORS.white,
                weight: "bold",
                size: "xl",
                wrap: true
              },
              {
                type: "text",
                text: "แบบฟอร์มขอความช่วยเหลือ",
                color: COLORS.white,
                size: "md",
                weight: "bold",
                wrap: true,
                margin: "sm"
              },
              {
                type: "text",
                text: meta.helper,
                color: "#d8f5f7",
                size: "sm",
                wrap: true,
                margin: "sm"
              }
            ]
          }
        ]
      },
      {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: `ขั้นตอน ${meta.order}/5`,
            color: COLORS.white,
            size: "sm",
            weight: "bold",
            align: "center"
          },
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: progressBar(meta.order)
          }
        ]
      }
    ]
  };
}

function detailSummary(data = {}) {
  const rows = [];
  if (data.full_name) rows.push(`ชื่อ: ${data.full_name}`);
  if (data.location) rows.push(`ที่อยู่: ${data.location}`);
  if (data.problem) rows.push(`รายละเอียด: ${data.problem}`);
  if (data.phone) rows.push(`หมายเลขโทรศัพท์ติดต่อ: ${data.phone}`);
  return rows;
}

function buildDataBox(data = {}) {
  const rows = detailSummary(data);
  if (!rows.length) return null;
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: "1px",
    cornerRadius: "16px",
    paddingAll: "16px",
    spacing: "sm",
    contents: [
      {
        type: "text",
        text: "ข้อมูลที่กรอกแล้ว",
        color: COLORS.brand,
        weight: "bold",
        size: "md"
      },
      ...rows.map((row) => ({
        type: "text",
        text: row,
        wrap: true,
        color: COLORS.text,
        size: "sm"
      }))
    ]
  };
}

function buildErrorBox(errorText = "") {
  if (!errorText) return null;
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: COLORS.dangerSoft,
    cornerRadius: "14px",
    paddingAll: "14px",
    contents: [
      {
        type: "text",
        text: errorText,
        color: COLORS.danger,
        wrap: true,
        size: "sm",
        weight: "bold",
        align: "center"
      }
    ]
  };
}

function buildInstructionCard(stepKey = "name") {
  const meta = STEP_META[stepKey] || STEP_META.name;
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: "#ececec",
    cornerRadius: "18px",
    paddingAll: "22px",
    spacing: "md",
    contents: [
      {
        type: "text",
        text: meta.title,
        size: "xxl",
        weight: "bold",
        color: "#000000",
        wrap: true,
        align: "center"
      },
      {
        type: "text",
        text: "ในช่องแชทข้อความด้านล่าง",
        size: "xl",
        weight: "bold",
        color: "#000000",
        wrap: true,
        align: "center"
      },
      {
        type: "text",
        text: meta.example,
        size: "sm",
        color: COLORS.muted,
        wrap: true,
        align: "center"
      }
    ]
  };
}

function buildHelpStepFlex(stepKey = "name", data = {}, options = {}) {
  const contents = [
    {
      type: "text",
      text: stepKey === "name" ? "เริ่มกรอกข้อมูลขอความช่วยเหลือครับ" : "กรุณากรอกข้อมูลตามขั้นตอน",
      size: "xl",
      weight: "bold",
      color: "#000000",
      wrap: true,
      align: "center"
    },
    buildInstructionCard(stepKey)
  ];

  const errorBox = buildErrorBox(options.errorText || "");
  if (errorBox) contents.push(errorBox);

  const dataBox = buildDataBox(data);
  if (dataBox) contents.push(dataBox);

  contents.push(
    {
      type: "button",
      style: "primary",
      color: COLORS.brand,
      height: "md",
      action: {
        type: "message",
        label: "พิมพ์ข้อมูลในช่องแชท",
        text: "พิมพ์ข้อมูลในช่องแชท"
      }
    },
    {
      type: "button",
      style: "primary",
      color: COLORS.danger,
      height: "md",
      action: {
        type: "message",
        label: "ยกเลิก",
        text: "ยกเลิก"
      }
    }
  );

  return {
    type: "flex",
    altText: `แบบฟอร์มขอความช่วยเหลือ ขั้นตอน ${STEP_META[stepKey]?.order || 1}/5`,
    contents: {
      type: "bubble",
      size: "mega",
      header: buildBrandHeader(stepKey),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "18px",
        contents
      }
    }
  };
}

function buildHelpConfirmFlex(data = {}, options = {}) {
  const detailRows = detailSummary(data).map((row) => ({
    type: "text",
    text: row,
    wrap: true,
    size: "lg",
    weight: "bold",
    color: "#000000",
    align: "center"
  }));

  const contents = [
    {
      type: "text",
      text: "กรุณาตรวจสอบความถูกต้องของข้อมูล",
      size: "xxl",
      weight: "bold",
      color: "#0f3f9b",
      wrap: true,
      align: "center"
    }
  ];

  const errorBox = buildErrorBox(options.errorText || "");
  if (errorBox) contents.push(errorBox);

  contents.push(
    {
      type: "box",
      layout: "vertical",
      backgroundColor: "#ececec",
      cornerRadius: "18px",
      paddingAll: "18px",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "รายละเอียด:",
          size: "xl",
          weight: "bold",
          color: "#000000",
          align: "center"
        },
        ...detailRows
      ]
    },
    {
      type: "button",
      style: "primary",
      color: COLORS.brand,
      height: "md",
      action: {
        type: "message",
        label: "แก้ไขข้อมูล",
        text: "แก้ไขข้อมูล"
      }
    },
    {
      type: "button",
      style: "primary",
      color: COLORS.danger,
      height: "md",
      action: {
        type: "message",
        label: "ส่งข้อมูล / SENT",
        text: "ส่งข้อมูล / SENT"
      }
    }
  );

  return {
    type: "flex",
    altText: "ตรวจสอบข้อมูลก่อนส่ง",
    contents: {
      type: "bubble",
      size: "mega",
      header: buildBrandHeader("confirm"),
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "18px",
        contents
      }
    }
  };
}

function buildHelpExecutiveSummaryFlex(item = {}) {
  const rows = [
    `ชื่อ:${item.full_name || "-"}`,
    `ที่อยู่:${item.location || "-"}`,
    `รายละเอียด:${item.problem || "-"}`,
    `หมายเลขโทรศัพท์ติดต่อ:${item.phone || "-"}`
  ];

  return {
    type: "flex",
    altText: `ทีมงานรับข้อมูลแล้ว ${item.case_code || ""}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: COLORS.brand,
        paddingAll: "18px",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              {
                type: "image",
                url: DEFAULT_LOGO_URL,
                size: "xxs",
                aspectMode: "cover",
                aspectRatio: "1:1",
                flex: 0,
                backgroundColor: COLORS.white,
                cornerRadius: "999px"
              },
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: "Misbahul Aitam",
                    color: COLORS.white,
                    weight: "bold",
                    size: "xl",
                    wrap: true
                  },
                  {
                    type: "text",
                    text: "แบบฟอร์มขอความช่วยเหลือ",
                    color: COLORS.white,
                    size: "md",
                    weight: "bold",
                    wrap: true,
                    margin: "sm"
                  }
                ]
              }
            ]
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "18px",
        contents: [
          {
            type: "text",
            text: "ทีมงานรับข้อมูลแล้ว",
            size: "xxl",
            weight: "bold",
            color: "#0f3f9b",
            wrap: true,
            align: "center"
          },
          {
            type: "text",
            text: `หมายเลขเคส : ${item.case_code || "-"}`,
            size: "xl",
            weight: "bold",
            color: "#000000",
            wrap: true,
            align: "center"
          },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: COLORS.brand,
            cornerRadius: "20px",
            paddingAll: "18px",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: "รายละเอียด:",
                size: "xl",
                weight: "bold",
                color: COLORS.white,
                align: "center"
              },
              ...rows.map((row) => ({
                type: "text",
                text: row,
                wrap: true,
                size: "xl",
                weight: "bold",
                color: COLORS.white,
                align: "center"
              }))
            ]
          },
          {
            type: "text",
            text: "ทางทีมงานของมูลนิธิจะรีบตรวจสอบและดำเนินการติดต่อกลับโดยเร็วที่สุด",
            size: "lg",
            weight: "bold",
            color: "#000000",
            wrap: true,
            align: "center"
          }
        ]
      }
    }
  };
}

function buildHelpCancelFlex() {
  return {
    type: "flex",
    altText: "ยกเลิกการกรอกข้อมูลแล้ว",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: COLORS.danger,
        paddingAll: "18px",
        contents: [
          {
            type: "text",
            text: "ยกเลิกฟอร์มแล้ว",
            color: COLORS.white,
            weight: "bold",
            size: "xl",
            align: "center"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "18px",
        contents: [
          {
            type: "text",
            text: "คุณสามารถพิมพ์ 'ขอความช่วยเหลือ' เพื่อเริ่มต้นใหม่ได้ทุกเมื่อ",
            wrap: true,
            size: "lg",
            weight: "bold",
            color: "#000000",
            align: "center"
          },
          {
            type: "button",
            style: "primary",
            color: COLORS.brand,
            action: {
              type: "message",
              label: "กลับสู่เมนูหลักขอความช่วยเหลือ",
              text: "ขอความช่วยเหลือ"
            }
          }
        ]
      }
    }
  };
}

module.exports = {
  buildHelpStepFlex,
  buildHelpCancelFlex,
  buildHelpConfirmFlex,
  buildHelpExecutiveSummaryFlex,
  sanitizeHelpWizardInput,
  normalizePhoneInput,
  isValidPhoneInput,
  validateHelpWizardField,
  isWizardControlCommand
};
