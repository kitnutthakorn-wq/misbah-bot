"use strict";

const TOTAL_STEPS = 5;
const BRAND = {
  primary: "#0B7C86",
  secondary: "#163C72",
  accent: "#C9A227",
  soft: "#F7FBFC",
  line: "#D7E7EA",
  danger: "#DC2626",
  success: "#1F8F4D",
  muted: "#5F7285"
};

function cleanText(value = "") {
  return String(value == null ? "" : value).trim();
}

function sanitizeHelpWizardInput(value = "") {
  return cleanText(String(value).replace(/\s+/g, " "));
}

function normalizePhoneInput(value = "") {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("66") && digits.length >= 11) {
    return `0${digits.slice(2)}`;
  }
  return digits;
}

function isValidPhoneInput(value = "") {
  const normalized = normalizePhoneInput(value);
  return /^0\d{8,9}$/.test(normalized);
}

function formatPhoneForDisplay(value = "") {
  const normalized = normalizePhoneInput(value);
  if (!normalized) return "-";
  if (normalized.length === 10) {
    return `${normalized.slice(0,3)}-${normalized.slice(3,6)}-${normalized.slice(6)}`;
  }
  if (normalized.length === 9) {
    return `${normalized.slice(0,2)}-${normalized.slice(2,5)}-${normalized.slice(5)}`;
  }
  return normalized;
}

function logoHero() {
  const logoUrl = cleanText(process.env.MISBAHUL_AITAM_LOGO_URL || "");
  if (!logoUrl) return null;
  return {
    type: "image",
    url: logoUrl,
    size: "full",
    aspectRatio: "20:8",
    aspectMode: "fit",
    backgroundColor: "#FFFFFF"
  };
}

function progressBar(stepNumber = 1) {
  const bars = [];
  for (let i = 1; i <= TOTAL_STEPS; i += 1) {
    bars.push({
      type: "box",
      layout: "vertical",
      flex: 1,
      height: "8px",
      cornerRadius: "999px",
      backgroundColor: i <= stepNumber ? BRAND.accent : "#D8E5E8",
      contents: []
    });
  }
  return {
    type: "box",
    layout: "horizontal",
    spacing: "sm",
    margin: "md",
    contents: bars
  };
}

function dataRows(data = {}) {
  const rows = [];
  if (cleanText(data.full_name)) rows.push(`ชื่อ: ${cleanText(data.full_name)}`);
  if (cleanText(data.location)) rows.push(`พื้นที่: ${cleanText(data.location)}`);
  if (cleanText(data.problem)) rows.push(`รายละเอียด: ${cleanText(data.problem)}`);
  if (cleanText(data.phone)) rows.push(`เบอร์: ${formatPhoneForDisplay(data.phone)}`);
  return rows.map((text) => ({
    type: "text",
    text,
    size: "sm",
    color: "#1F2937",
    wrap: true,
    margin: "sm"
  }));
}

function buildHeader(stepNumber, title, subtitle) {
  return {
    type: "box",
    layout: "vertical",
    backgroundColor: BRAND.secondary,
    paddingAll: "18px",
    contents: [
      {
        type: "text",
        text: "Misbahul Aitam",
        color: "#F8FAFC",
        weight: "bold",
        size: "lg",
        align: "center"
      },
      {
        type: "text",
        text: title,
        color: "#FFFFFF",
        weight: "bold",
        size: "xl",
        align: "center",
        margin: "md",
        wrap: true
      },
      {
        type: "text",
        text: subtitle,
        color: "#DDEAF7",
        size: "sm",
        align: "center",
        margin: "sm",
        wrap: true
      },
      {
        type: "text",
        text: `ขั้นตอน ${stepNumber}/${TOTAL_STEPS}`,
        color: "#FDE68A",
        size: "xs",
        weight: "bold",
        align: "center",
        margin: "md"
      },
      progressBar(stepNumber)
    ]
  };
}

function buildStepConfig(step = "name", data = {}) {
  switch (step) {
    case "name":
      return {
        number: 1,
        title: "กรุณาพิมพ์ชื่อและนามสกุล",
        subtitle: "เพื่อให้ทีมงานติดต่อและบันทึกข้อมูลได้ถูกต้อง",
        hint: "ตัวอย่าง: นายสมชาย ใจดี"
      };
    case "location":
      return {
        number: 2,
        title: "กรุณาพิมพ์สถานที่ / พื้นที่เกิดเหตุ",
        subtitle: "ระบุอำเภอ จังหวัด หรือจุดสังเกตสำคัญให้ชัดเจน",
        hint: "ตัวอย่าง: ต.จะบังติกอ อ.เมือง จ.ปัตตานี"
      };
    case "problem":
      return {
        number: 3,
        title: "กรุณาพิมพ์รายละเอียดปัญหา",
        subtitle: "เล่าให้ทีมงานเข้าใจสิ่งที่ต้องการความช่วยเหลือมากที่สุด",
        hint: "ตัวอย่าง: ไม่มีอาหาร เด็กเล็ก 2 คน บ้านเสียหายจากพายุ"
      };
    case "phone":
      return {
        number: 4,
        title: "กรุณาพิมพ์เบอร์โทรติดต่อกลับ",
        subtitle: "ระบบจะตรวจสอบรูปแบบให้อัตโนมัติ",
        hint: "ตัวอย่าง: 0812345678"
      };
    case "summary":
      return {
        number: 5,
        title: "ตรวจสอบข้อมูลก่อนยืนยัน",
        subtitle: "หากข้อมูลถูกต้อง ให้พิมพ์เบอร์โทรอีกครั้งหรือกดส่งต่อ",
        hint: "ทีมงานจะใช้ข้อมูลนี้ในการประสานงาน"
      };
    default:
      return {
        number: 1,
        title: "กรุณากรอกข้อมูล",
        subtitle: "ระบบจะพาไปทีละขั้นตอน",
        hint: ""
      };
  }
}

function buildHelpStepFlex(step = "name", data = {}, options = {}) {
  const cfg = buildStepConfig(step, data);
  const bodyContents = [
    {
      type: "box",
      layout: "vertical",
      backgroundColor: BRAND.soft,
      borderColor: BRAND.line,
      borderWidth: "1px",
      cornerRadius: "18px",
      paddingAll: "16px",
      contents: [
        {
          type: "text",
          text: cfg.title,
          size: "xl",
          weight: "bold",
          color: BRAND.secondary,
          align: "center",
          wrap: true
        },
        {
          type: "text",
          text: cfg.hint,
          size: "sm",
          color: BRAND.muted,
          align: "center",
          margin: "md",
          wrap: true
        }
      ]
    }
  ];

  const rows = dataRows(data);
  if (rows.length) {
    bodyContents.push({
      type: "box",
      layout: "vertical",
      backgroundColor: "#FFFFFF",
      borderColor: BRAND.line,
      borderWidth: "1px",
      cornerRadius: "16px",
      paddingAll: "14px",
      margin: "md",
      contents: [
        {
          type: "text",
          text: "ข้อมูลที่กรอกแล้ว",
          size: "sm",
          weight: "bold",
          color: BRAND.primary
        },
        ...rows
      ]
    });
  }

  if (cleanText(options.errorText)) {
    bodyContents.push({
      type: "box",
      layout: "vertical",
      backgroundColor: "#FEF2F2",
      borderColor: "#FECACA",
      borderWidth: "1px",
      cornerRadius: "16px",
      paddingAll: "14px",
      margin: "md",
      contents: [
        {
          type: "text",
          text: options.errorText,
          size: "sm",
          weight: "bold",
          color: BRAND.danger,
          wrap: true,
          align: "center"
        }
      ]
    });
  }

  const bubble = {
    type: "bubble",
    size: "mega",
    header: buildHeader(cfg.number, cfg.title, cfg.subtitle),
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "18px",
      contents: bodyContents
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "18px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: BRAND.primary,
          height: "md",
          action: {
            type: "message",
            label: "พิมพ์ข้อมูลต่อ",
            text: step === "phone" ? "0812345678" : "พร้อมกรอกข้อมูล"
          }
        },
        {
          type: "button",
          style: "secondary",
          height: "md",
          action: {
            type: "message",
            label: "ยกเลิกฟอร์ม",
            text: "ยกเลิกฟอร์ม"
          }
        }
      ]
    }
  };

  const hero = logoHero();
  if (hero) bubble.hero = hero;

  return {
    type: "flex",
    altText: `${cfg.title} (ขั้นตอน ${cfg.number}/${TOTAL_STEPS})`,
    contents: bubble
  };
}

function buildHelpCancelFlex() {
  const bubble = {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: BRAND.danger,
      paddingAll: "18px",
      contents: [
        {
          type: "text",
          text: "ยกเลิกการกรอกข้อมูลแล้ว",
          color: "#FFFFFF",
          weight: "bold",
          size: "xl",
          align: "center",
          wrap: true
        }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "18px",
      contents: [
        {
          type: "text",
          text: "หากต้องการเริ่มใหม่ พิมพ์ 'ขอความช่วยเหลือ' ได้ทุกเมื่อ",
          size: "md",
          color: BRAND.secondary,
          wrap: true,
          align: "center"
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "18px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: BRAND.primary,
          action: {
            type: "message",
            label: "เริ่มใหม่",
            text: "ขอความช่วยเหลือ"
          }
        }
      ]
    }
  };

  const hero = logoHero();
  if (hero) bubble.hero = hero;

  return {
    type: "flex",
    altText: "ยกเลิกการกรอกข้อมูล",
    contents: bubble
  };
}

function buildHelpExecutiveSummaryFlex(item = {}) {
  const bubble = {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: BRAND.success,
      paddingAll: "18px",
      contents: [
        {
          type: "text",
          text: "ทีมงานรับข้อมูลแล้ว",
          color: "#FFFFFF",
          weight: "bold",
          size: "xl",
          align: "center"
        },
        {
          type: "text",
          text: `เลขเคส ${cleanText(item.case_code) || "-"}`,
          color: "#DCFCE7",
          size: "md",
          weight: "bold",
          align: "center",
          margin: "sm"
        },
        {
          type: "text",
          text: "Executive Summary",
          color: "#ECFCCB",
          size: "xs",
          align: "center",
          margin: "sm"
        }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "18px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              backgroundColor: "#EFF6FF",
              cornerRadius: "14px",
              paddingAll: "12px",
              contents: [
                { type: "text", text: "สถานะ", size: "xs", color: BRAND.muted, align: "center" },
                { type: "text", text: "รับเรื่องแล้ว", size: "sm", weight: "bold", color: BRAND.secondary, align: "center", margin: "sm" }
              ]
            },
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              backgroundColor: "#FEFCE8",
              cornerRadius: "14px",
              paddingAll: "12px",
              contents: [
                { type: "text", text: "ระดับเคส", size: "xs", color: BRAND.muted, align: "center" },
                { type: "text", text: cleanText(item.priority) === "urgent" ? "ด่วน" : "ปกติ", size: "sm", weight: "bold", color: cleanText(item.priority) === "urgent" ? BRAND.danger : BRAND.primary, align: "center", margin: "sm" }
              ]
            }
          ]
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: "#FFFFFF",
          borderColor: BRAND.line,
          borderWidth: "1px",
          cornerRadius: "16px",
          paddingAll: "14px",
          contents: [
            { type: "text", text: `ชื่อ: ${cleanText(item.full_name) || "-"}`, size: "sm", wrap: true },
            { type: "text", text: `พื้นที่: ${cleanText(item.location) || "-"}`, size: "sm", wrap: true, margin: "sm" },
            { type: "text", text: `รายละเอียด: ${cleanText(item.problem) || "-"}`, size: "sm", wrap: true, margin: "sm" },
            { type: "text", text: `เบอร์: ${formatPhoneForDisplay(item.phone)}`, size: "sm", wrap: true, margin: "sm" }
          ]
        },
        {
          type: "text",
          text: "ทีมงานจะตรวจสอบและประสานงานกลับโดยเร็วที่สุด",
          size: "sm",
          color: BRAND.muted,
          align: "center",
          wrap: true
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "18px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: BRAND.primary,
          action: {
            type: "message",
            label: "ติดตามการขอความช่วยเหลือ",
            text: "ติดตามการขอความช่วยเหลือ"
          }
        },
        {
          type: "button",
          style: "secondary",
          action: {
            type: "message",
            label: "ติดต่อเจ้าหน้าที่",
            text: "ติดต่อเจ้าหน้าที่"
          }
        }
      ]
    }
  };

  const hero = logoHero();
  if (hero) bubble.hero = hero;

  return {
    type: "flex",
    altText: `ทีมงานรับข้อมูลแล้ว ${cleanText(item.case_code) || ""}`,
    contents: bubble
  };
}

module.exports = {
  buildHelpStepFlex,
  buildHelpCancelFlex,
  buildHelpExecutiveSummaryFlex,
  sanitizeHelpWizardInput,
  normalizePhoneInput,
  isValidPhoneInput,
  formatPhoneForDisplay
};
