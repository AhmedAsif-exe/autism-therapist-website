const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const Subscriber = require("../Schema/Subscriber");
const { createClient } = require("@sanity/client");
const imageUrlBuilder = require("@sanity/image-url");

// 🔹 Setup Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: "2025-09-04", // or a fixed date like "2023-01-01"
  useCdn: false,
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // your app password
  },
});
function formatDate(isoString) {
  const date = new Date(isoString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
router.post("/send", async (req, res) => {
  const { firstName, lastName, email, phone, enquiryType, message } = req.body;

  try {
    // transporter

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "ahmedaanasif@gmail.com", // 👈 where you want to receive the mails
      subject: `${enquiryType}`,
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4BB7BA; margin-bottom: 10px;">New Contact Form Submission</h2>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
    
      
      <h3 style="margin-top: 20px; color: #F97544;">Message</h3>
      <p style="background:#f9f9f9; padding: 15px; border-left: 4px solid #4BB7BA;">
        ${message.replace(/\n/g, "<br>")}
      </p>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #888;">
        This email was automatically sent from the ABA Virtual contact form.
      </p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

router.post("/announce", async (req, res) => {
  try {
    const {
      _type,
      _id,
      title,
      description,
      mainImage,
      categories,
      _createdAt,
      authors,
    } = req.body; // from Sanity webhook

    // ✅ Resolve Sanity images
    const mainImageUrl = mainImage
      ? urlFor(mainImage).width(800).url()
      : "https://via.placeholder.com/800x400";

    const authorImageUrl = authors?.[0]?.image
      ? urlFor(authors?.[0]?.image).width(100).height(100).url()
      : "https://via.placeholder.com/100";

    // Newsletter subject/content
    const subject = `📰 New Blog Post: ${title}`;

    // Fetch subscribers
    const subscribers = await Subscriber.find();
    if (!subscribers.length) {
      return res.status(400).json({ error: "No subscribers found" });
    }

    // Send email to each subscriber
    for (let sub of subscribers) {
      await transporter.sendMail({
        from: `"Your Blog" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject,
        html: `
 <div style="max-width:600px;margin:20px auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;font-family:Arial, sans-serif;background:#ffffff;">
  <!-- Blog Content -->
  <div style="padding:16px;">
    
    <!-- Category + Date -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
  <tr>
    <td align="left">
      <span style="display:inline-block;background:#10B981;color:#fff;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:bold;text-align:center;">
        ${categories || ""}
      </span>
    </td>
    <td align="right">
      <span style="font-size:12px;color:#555;">
        ${_createdAt || new Date().getDate.toString()}
      </span>
    </td>
  </tr>
</table>


    <!-- Title -->
    <h2 style="font-size:22px;font-weight:700;color:#f97544;margin:0 0 8px 0;text-align:left;">
      ${title || "New Blog"}
    </h2>

    <!-- Description -->
    <p style="font-size:14px;color:#555;line-height:1.5;margin:0 0 16px 0;text-align:left;">
     ${description}
    </p>
  </div>

  <!-- Author + Read More -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:16px;color:#265c7e;">
  <tr>
    <!-- Author -->
    <td align="left" style="vertical-align:middle;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <img src="${authorImageUrl || ""}"
                 alt="Faiza Faizan"
                 width="24" height="24"
                 style="border-radius:50%;background:#265c7e;display:block;" />
          </td>
          <td style="padding-left:8px;vertical-align:middle;">
            <span style="font-size:12px;line-height:1.4;">${
              authors?.[0]?.name || "Author Name"
            }</span>
          </td>
        </tr>
      </table>
    </td>

    <!-- Read More button -->
    <td align="right" style="vertical-align:middle;">
      <a href="${process.env.FRONTEND_URL}/blogs/${_id}"
         style="display:inline-block;border-radius:9999px;padding:8px 16px;background:#10B981;color:#fff;text-decoration:none;font-size:14px;font-family:Arial, sans-serif;">
        Read More
      </a>
    </td>
  </tr>
</table>


</div>`,
      });
    }

    res.json({ success: true, message: `Newsletter sent for ${_type}` });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ error: "Failed to send newsletter" });
  }
});
module.exports = router;
