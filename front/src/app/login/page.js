import Image from "next/image";
import { LoginForm } from "@/components/loginForm/index";

export default function Page() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-zinc-900">
            <video
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                src="/video/login.mp4"
                autoPlay
                loop
                muted
                playsInline
            />

            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="relative w-full max-w-[1100px] h-auto md:h-[650px] m-4 flex rounded-[32px] overflow-hidden shadow-2xl bg-white">
                
                <div className="hidden md:block relative w-1/2 h-full bg-zinc-900">
                    <Image
                        src="/imagen/login.png"
                        alt="EcoFlow login illustration"
                        fill
                        className="object-cover"
                        priority
                        quality={100}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-12 z-10">
                        <h2 className="text-white text-4xl font-bold leading-tight drop-shadow-lg tracking-wide">
                            Gestão ambiental<br />
                            <span className="text-green-400">simplificada.</span>
                        </h2>
                        <p className="text-gray-300 mt-4 text-lg font-light max-w-sm">
                            Controle, monitore e otimize seus processos com eficiência e sustentabilidade.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 h-full bg-white flex items-center justify-center p-8 md:p-12 relative">
                    <LoginForm />
                </div>

            </div>
        </div>
    );
}