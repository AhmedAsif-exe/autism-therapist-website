import { useState, useRef, useEffect } from "react";

const faqData = [
  {
    id: "new-info",
    title: "Where can we contact you?",
    content: (
      <p className="text-md text-start text-[#265c7e]">
        I’m most responsive on my email:{" "}
        <strong>
          <i>contact@abavirtual.com </i>
        </strong>
        and also on other platforms. For more info, please visit the{" "}
        <a
          href="/contact"
          className="hover:cursor-pointer underline text-[#f97544]"
        >
          contact
        </a>{" "}
        page
      </p>
    ),
  },
  {
    id: "basic-update",
    title: "Where do you work from?",
    content: (
      <p className="text-md text-start text-[#265c7e]">
        Because I travel a lot, my work system is designed virtually and so all
        sessions are conducted on their respective timings regardless of my
        presence in a single country.
      </p>
    ),
  },
  {
    id: "image-update",
    title: "Can you supervise RBTs?",
    content: (
      <p className="text-md text-start text-[#265c7e]">
        No. I can only provide supervision to ABATs following ethics set by the
        credentialing boards.
      </p>
    ),
  },
  {
    id: "faq-example",
    title: "Do you require masters in ABA to sit for QASP exam?",
    content: (
      <p className="text-md text-start text-[#265c7e]">
        You do not require masters in any filed to sit for the exam of QASP. A
        minimum of a bachelor’s degree is the requirement. Read on{" "}
        <a
          href=" https://qababoard.com/pages/qualified-autism-services-practitioner-
        supervisor/"
          className="hover:cursor-pointer underline text-[#f97544]"
        >
          QABA’s website
        </a>{" "}
        for more information on requirement criteria
      </p>
    ),
  },
  {
    id: "5",
    title: "Can you work without supervision after attaining QASP?",
    content: (
      <p className="text-md text-start text-[#265c7e]">
        {" "}
        QASP is a mid-tier credential offered by the Qualified Applied Behavior
        Analysis Credentialing Board (QABA). This credetnial can assess,
        supervise and create intervention plans but, it does require supervision
        from higher level credentials (e.g., QBA, BCBA) and also are authorized
        to supervise lower level credential i.e., ABAT. Read on{" "}
        <a
          href="https://qababoard.com/qasp-s-scope/"
          className="hover:cursor-pointer underline text-[#f97544]"
        >
          QABA’s website
        </a>{" "}
        for more information on the scope of a QASP-S;
      </p>
    ),
  },
];
const Faq = () => {
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const contentRefs = useRef({});

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => setOpenId(id), 200);
    }
  }, []);

  const toggle = (id) => {
    setOpenId((prevId) => (prevId === id ? null : id));
  };

  const filteredFaqs = faqData.filter((faq) => {
    const plainText = typeof faq.content === "string" ? faq.content : faq.title;
    return plainText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="mt-[50px]">
      <div className=" max-w-[1200px] mx-auto px-6 py-8 font-sans">
        <h2
          className="l:text-[70px] text-[50px] font-[raleway] italic-not text-[#265c7e] text-center m-0 mb-[30px]"
          id="our-process-header"
        >
          FAQ
        </h2>

        {filteredFaqs.map(({ id, title, content }, idx) => {
          const isOpen = openId === id;

          return (
            <div
              key={id}
              className={`border border-[#28a5a8] ${
                idx !== 0 ? "border-t-white" : "rounded-t-lg"
              } ${
                idx === filteredFaqs.length - 1 && "rounded-b-lg"
              } px-2  transition-all duration-500 ${isOpen ? " rounded" : ""}`}
              id={id}
            >
              <button
                onClick={() => toggle(id)}
                className="flex items-center justify-between w-full py-4 focus:outline-none"
              >
                <h3 className="text-xl text-[#f97544] font-medium text-left">
                  {title}
                </h3>
                <span
                  className={`transform transition-transform text-[#f97544] text-xl duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              <div
                ref={(el) => {
                  contentRefs.current[id] = el;
                }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  maxHeight: isOpen
                    ? `${contentRefs.current[id]?.scrollHeight}px`
                    : "0px",
                }}
              >
                <div className="px-5 pb-5 text-sm opacity-90">{content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Faq;
