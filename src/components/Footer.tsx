import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white h-20 relative">
      <div className="h-full mx-auto w-full max-w-screen-xl px-2.5 md:px-20">
        <div className="border-t border-gray-200" />
        <div className="h-full flex flex-col md:flex-row md:justify-between justify-center items-center">
          <div className="text-center md:text-left pb-2 md:pb-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()}. IAG MagicSlides.app Submission
              by{" "}
              <Link
                href="https://hardikarora.netlify.app/"
                target="_blank"
                className="font-semibold underline "
              >
                Hardik
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex space-x-8">
              <Link
                href="https://github.com/hardikarora2311"
                target="_blank"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Github
              </Link>
              <Link
                target="_blank"
                href="https://www.linkedin.com/in/hardika2311/"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Linkedin
              </Link>
              <Link
                target="_blank"
                href="https://twitter.com/HardikA2311_"
                className="text-sm text-muted-foreground hover:text-gray-600"
              >
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
