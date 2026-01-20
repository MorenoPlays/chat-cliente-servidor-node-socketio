import ImageCarousel from "@/components/auth/ImageCarousel";
import CreateAccount from "@/components/auth/CreateAccount";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-[#0D1020] items-center justify-center p-4 lg:p-8">
      {/* Main container with glow effect */}
      <div className="relative w-full max-w-6xl">
        {/* Background glow effects */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-cyan-500/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Card container */}
        <div className="relative bg-[#0b0f22] backdrop-blur-xl rounded-3xl border border-cyan-400/40 overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
            {/* Left side - Carousel */}
            <div className="hidden lg:block lg:w-1/2 p-4">
              <ImageCarousel />
            </div>

            {/* Mobile carousel - smaller version */}
            <div className="lg:hidden h-48 relative overflow-hidden rounded-t-3xl">
              <ImageCarousel />
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center">
              <CreateAccount />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
