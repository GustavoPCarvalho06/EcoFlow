import Image from "next/image"
import { LoginForm } from "@/components/loginForm/index"

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl shadow-lg bg-white">
        {/* Lado esquerdo - imagem */}
        <div className="hidden md:flex w-1/2 relative">
          <Image
            src="/login.png" // imagem dentro da pasta public
            alt="EcoFlow login illustration"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Lado direito - formulário */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
