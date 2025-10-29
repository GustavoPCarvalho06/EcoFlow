import Image from "next/image"
import { LoginForm } from "@/components/loginForm/index"

export default function Page() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-50 p-6 overflow-hidden">

            <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/video/login.mp4"
                autoPlay
                loop
                muted
                playsInline
            />
            
            {/* blur */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl bg-white/80 backdrop-blur-md">

                <div className="hidden md:flex w-1/2 relative">
                    <Image
                        src="/imagen/login.png"
                        alt="EcoFlow login illustration"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="flex w-full md:w-1/2 items-center justify-center p-8">
                    <div className="w-full max-w-sm">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
