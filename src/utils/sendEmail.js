import { Resend } from "resend";

export const sendEmail = async (to, subject, html) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return false;
    }

    if (!result.data || !result.data.id) {
      console.error("Resend returned no email ID");
      return false;
    }

    console.log("Email sent successfully:", result.data.id);
    return true;

  } catch (error) {
    console.error("Email sending failed:", error.message);
    return false;
  }
};