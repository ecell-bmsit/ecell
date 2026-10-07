import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../components/Navbar/PhoneMenu.css"; // Import to ensure SeasonSerif is loaded

const phrases = ["is off", "went wrong", "broke"];

const NotFound = () => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer;
    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      setText(
        isDeleting
          ? fullText.substring(0, text.length - 1)
          : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 50 : 150);

      if (!isDeleting && text === fullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      } else {
        timer = setTimeout(handleType, typingSpeed);
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <>
      <style>
        {`
          /* Base (Dark Mode) */
          .not-found-container {
            background-color: #111;
            color: #E6E1D8;
          }
          .not-found-text-grey {
            color: #777;
          }
          .not-found-border {
            background-color: #E6E1D8;
          }
          .not-found-box {
            background-color: #E6E1D8;
            color: #111;
          }

          /* Light Mode Overrides */
          .light-theme .not-found-container {
            background-color: #E6E1D8;
            color: #111;
          }
          .light-theme .not-found-text-grey {
            color: #989898;
          }
          .light-theme .not-found-border {
            background-color: #333;
          }
          .light-theme .not-found-box {
            background-color: #333;
            color: white;
          }
        `}
      </style>
      <div className="not-found-container preserve-color absolute inset-0 z-[100] min-h-screen w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center" style={{ fontFamily: "var(--font-subheading)" }}>
          <h1 className="text-3xl md:text-[40px] mb-4 font-normal tracking-wide">404</h1>
          
          <div className="flex items-center text-5xl md:text-[80px] font-normal mb-16 tracking-tight leading-none mt-2">
            <span>Something</span>
            <span className="mx-2 md:mx-4 not-found-text-grey">{text}</span>
            <span className="not-found-text-grey ml-1 font-light animate-[pulse_1s_ease-in-out_infinite]">|</span>
          </div>

          <Link
            to="/"
            className="group flex items-center gap-3 text-xl md:text-[22px]"
            style={{ fontFamily: "var(--font-subheading)" }}
          >
            <span className="relative pb-[1px] hover:text-current">
              Back to home
              <span className="absolute left-0 bottom-0 w-full h-[1px] not-found-border transition-transform duration-300 origin-left group-hover:scale-x-0 group-hover:duration-300"></span>
            </span>
            <div className="not-found-box w-7 h-7 flex items-center justify-center text-sm">
              →
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
