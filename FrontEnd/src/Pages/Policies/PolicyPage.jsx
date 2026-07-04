import { Navigate } from "react-router-dom";
import PageTemplate from "Utils/PageTemplate";
import aboutBanner from "Assets/Images/about-banner.jpg";
import { policies } from "./policyData";

const PolicyPage = ({ slug }) => {
  const policy = policies[slug];
  if (!policy) return <Navigate to="/" replace />;

  return (
    <PageTemplate
      title={policy.title}
      subtitle={`Effective Date: ${policy.effectiveDate}`}
      src={aboutBanner}
    >
      <div className="l:px-[100px] px-[25px] py-8 max-w-4xl mx-auto">
        <p className="text-[#265c7e] text-justify leading-relaxed mb-8">
          {policy.intro}
        </p>

        {policy.sections.map((section) => (
          <section key={section.heading} className="mb-6">
            <h2 className="text-[#f97544] font-[raleway] text-xl l:text-2xl font-semibold mb-2">
              {section.heading}
            </h2>
            {section.paragraphs?.map((p) => (
              <p
                key={p}
                className="text-[#265c7e] text-justify leading-relaxed mb-2"
              >
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="list-disc pl-6 space-y-1 text-[#265c7e] mb-2">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.afterList && (
              <p className="text-[#265c7e] text-justify leading-relaxed mb-2">
                {section.afterList}
              </p>
            )}
          </section>
        ))}

        <section className="mt-8 pt-4 border-t border-[#28a5a8]">
          <h2 className="text-[#f97544] font-[raleway] text-xl l:text-2xl font-semibold mb-2">
            Contact
          </h2>
          <p className="text-[#265c7e] leading-relaxed">
            For questions regarding this policy, please contact:{" "}
            <a
              href={`mailto:${policy.contactEmail}`}
              className="text-[#f97544] underline"
            >
              {policy.contactEmail}
            </a>
          </p>
          {policy.contactNote && (
            <p className="text-[#265c7e] leading-relaxed mt-2">
              {policy.contactNote}
            </p>
          )}
        </section>
      </div>
    </PageTemplate>
  );
};

export default PolicyPage;
