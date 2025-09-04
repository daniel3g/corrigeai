import Link from "next/link"
import ForwardRecoveryHash from "@/components/ForwardRecoveryHash"
import Logo from "@/public/images/logo.webp"
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
        <div className="flex flex-col justify-center px-20 py-10">
            <h2 className="text-6xl font-bold text-center">Revolucione a correção <br />de redações com <br /><span className="text-customBlue">Inteligência Artificial</span></h2>
            <p className="text-center text-xl mt-8">Uma plataforma completa que oferece feedback instantâneo e preciso para alunos, e <br /> ferramentas avançadas de acompanhamento para professores.</p>
            <div className="flex justify-center mt-10 gap-5">
                <Link href="/login"><button className="bg-customBlue text-customLight py-2 px-8 rounded-md">Sou Aluno</button></Link>
                <Link href="/login"><button className="rounded-md border border-customBlue py-2 px-8">Sou Professor</button></Link>
            </div>
        </div>
        <div className="flex flex-col items-center bg-customBackground py-20 px-20">
            <h2 className="text-3xl font-semibold">Por que escolher o EstudAI?</h2>
            <div className="flex gap-10 mt-10">
                <div className="flex flex-col bg-white border rounded-xl p-6 w-96">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-zap h-10 w-10 text-primary mb-2"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
                    <h3 className="font-semibold">Correção Instantânea</h3>
                    <p className="text-sm mt-3">IA avançada analisa redações em segundos, oferecendo feedback detalhado e nota imediata.</p>
                </div>
                <div className="flex flex-col bg-white border rounded-xl p-6 w-96">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trending-up h-10 w-10 text-accent mb-2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    <h3 className="font-semibold">Acompanhamento de Progresso</h3>
                    <p className="text-sm mt-3">Visualize a evolução do desempenho ao longo do tempo com gráficos e métricas detalhadas.</p>
                </div>
                <div className="flex flex-col bg-white border rounded-xl p-6 w-96">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users h-10 w-10 text-primary mb-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <h3 className="font-semibold">Dashboard para Professores</h3>
                    <p className="text-sm mt-3">Gerencie turmas, acompanhe alunos individualmente e acesse relatórios em tempo real.</p>
                </div>
            </div>
        </div>
        <div className="flex flex-col justify-center px-20 py-20">
            <h2 className="text-3xl font-bold text-center">Pronto para transformar o aprendizado?</h2>
            <p className="text-center text-xl mt-8">Junte-se a milhares de estudantes e professores que já estão usando o EstudAI para <br /> melhorar a qualidade da educação.</p>
            <div className="flex justify-center mt-10 gap-5">
                <Link href="/login"><button className="bg-customBlue text-customLight py-2 px-8 rounded-md">Cadastrar como Aluno</button></Link>
                <Link href="/login"><button className="rounded-md border border-customBlue py-2 px-8">Cadastrar como Professor</button></Link>
            </div>
        </div>
        <footer className="flex flex-col items-center px-20 py-10 border-t-2">
            <Image 
            src={Logo}
            alt="Logo estudai"
            />
            <p className="text-xs mt-10">© 2025 EstudAI. Transformando a educação através da tecnologia.</p>
        </footer>
        </>
    )
}