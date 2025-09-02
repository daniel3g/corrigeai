import Link from "next/link"
import ForwardRecoveryHash from "@/components/ForwardRecoveryHash"
import Logo from "../../public/images/logo.webp"
import Image from "next/image"


export default function Home() {
    return (
        <>
        <header className="flex items-center px-20 py-2 border-b-2">
            <ForwardRecoveryHash />
            <div className="flex w-1/2">
                <Image 
                src={Logo}
                alt="Logo estudai"
                />
            </div>
            <div className="flex justify-end w-1/2">
                <Link href="/login"><button className="flex p-3 rounded-md px-8 bg-customBlue text-customLight">Acessar Plataforma</button></Link>
            </div>           
        </header>
        <div></div>
        </>
    )
}