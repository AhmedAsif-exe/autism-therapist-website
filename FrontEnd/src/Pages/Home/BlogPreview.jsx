import blogs from "Assets/Images/blog_banner.jpg";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useEffect } from "react";
const blogsData = [
  {
    _id: "00728d16-b15c-4db6-96e3-0ab6601bdd7a",
    title: "Understanding React Context API",
    description:
      " A brief overview of React Context API for state management in modern web applications.",
    categories: "Technology ",
    authors: ["Faiza Faizan", "Ahmed Asif"],
    _createdAt: "2025-06-02T22:44:04Z",
  },
  {
    _id: "51168236-4e9d-4f32-9750-d5a13deff365",
    title: "The Rise of Mindful Technology in Everyday Life",
    description:
      "This blog showcases insightful content on autism therapy, personal growth, and expert guidance. Explore structured articles written with empathy and clarity to support individuals and families. Visuals and resources are curated to create an engaging, informative experience for all readers.",
    categories: "Technology",
    authors: ["Faiza Faizan"],
    _createdAt: "2025-05-29T15:13:05Z",
  },
];
// Dummy avatar import path assumes avatars are in /public/static/images/avatar/
const BlogFooter = ({ authors = [], _id }) => {
  return (
    <div className="flex flex-row items-center justify-between p-4 text-[#265c7e]">
      {/* Left: Avatars and names */}
      <div className="flex flex-row items-center gap-2">
        <div className="flex -space-x-2">
          {authors.slice(0, 3).map((authorName, index) => (
            <Avatar
              key={index}
              alt={authorName}
              src={`/static/images/avatar/${index + 1}.jpg`}
              sx={{
                width: 24,
                height: 24,
                backgroundColor: "#265c7e",
                fontSize: "0.75rem",
              }}
            />
          ))}
          {authors.length > 3 && (
            <div className="w-6 h-6 bg-[#265c7e] text-white text-xs flex items-center justify-center rounded-full">
              +{authors.length - 3}
            </div>
          )}
        </div>
        <p className="text-xs text-white">{authors.join(", ")}</p>
      </div>

      {/* Right: Read More button */}
      <a
        className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2"
        href={`/blogs/${_id}`}
      >
        Read More
      </a>
    </div>
  );
};
function formatDate(isoString) {
  const date = new Date(isoString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
const BlogPreview = () => {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        start: "top center",
        trigger: "#blog-section",
        once: true,
      },
    });

    tl.fromTo(
      "#blog-section",
      {
        clipPath: "inset(0% 0% 100% 0%)",
        maxHeight: 0,
        overflow: "hidden",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        maxHeight: 1000,
        duration: 3,
        ease: "power2.out",
      }
    );
  }, []);
  return (
    <div
      className="relative w-full overflow-hidden bg-center bg-cover after:absolute after:inset-0 after:bg-black after:opacity-50 after:content-['']"
      style={{ backgroundImage: `url(${blogs})` }}
      id="blog-section"
    >
      <div className=" relative z-10 p-4 px-10 text-white">
        <h2 className="ms:text-[70px] text-[40px] text-[#f97544] mt-2 font-[raleway]">
          Blogs
        </h2>
        <p className="ms:text-sm text-xs mt-2">
          <span className="text-[#f97544]">//</span> Stay in the loop with the
          latest about our products <span className="text-[#f97544]">//</span>
        </p>
        <div className="grid t:grid-cols-2 grid-cols-1  my-14 gap-10 max-w-[1440px] mx-auto">
          {blogsData.map((blog) => (
            <div className="flex flex-col h-full p-0 hover:cursor-pointer bg-white/10 backdrop-blur-md rounded-md">
              <div className="flex flex-col gap-1 p-4 grow pb-4">
                <div className="flex items-center justify-between w-full gap-1">
                  <span className="inline-block bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold text-xs max-w-[100px]">
                    {blog.categories}
                  </span>
                  <p className="text-xs">{formatDate(blog._createdAt)}</p>
                </div>
                <h2 className="text-left text-[25px] text-[#f97544] font-bold line-clamp-2">
                  {blog.title}
                </h2>
                <p className="text-left overflow-hidden text-ellipsis line-clamp-3">
                  {blog.description}
                </p>
              </div>
              <BlogFooter authors={blog.authors} _id={blog._id} />
            </div>
          ))}
        </div>
      </div>
      <a
        className="text-[#f97544] z-10 absolute bottom-5 px-4 py-2 rounded-lg right-10 cursor hover:underline"
        href="/blogs"
      >
        Read More
      </a>
    </div>
  );
};

export default BlogPreview;
