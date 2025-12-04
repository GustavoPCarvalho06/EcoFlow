"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApiUrl } from '@/app/context/ApiContext';

function VerificationComponent() {
    const apiUrl = useApiUrl();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verificando'); 
    const [message, setMessage] = useState('Verificando sua conta, por favor aguarde...');

    useEffect(() => {
        if (!token || !apiUrl) {
            if (!token) {
                setMessage("Nenhum token de verificação encontrado. O link pode estar incompleto.");
                setStatus('erro');
            }
            return;
        }

        const verifyAccount = async () => {
            try {
                const response = await fetch(`${apiUrl}/auth/verificar-conta/${token}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.mensagem);
                }

                setMessage(data.mensagem);
                setStatus('sucesso');
            } catch (err) {
                setMessage(err.message || "Ocorreu um erro ao tentar ativar sua conta.");
                setStatus('erro');
            }
        };

        verifyAccount();
    }, [token, apiUrl]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                {status === 'verificando' && (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                )}
                {status === 'sucesso' && (
                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                {status === 'erro' && (
                     <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                <h1 className={`mt-4 text-2xl font-bold ${status === 'sucesso' ? 'text-gray-900' : 'text-gray-800'}`}>
                    {status === 'verificando' && 'Aguarde um momento...'}
                    {status === 'sucesso' && 'Verificação Concluída!'}
                    {status === 'erro' && 'Falha na Verificação'}
                </h1>
                <p className="mt-2 text-gray-600">{message}</p>
                {status !== 'verificando' && (
                    <Link href="/" passHref>
                        <button className="mt-6 w-full rounded-md bg-green-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-green-700">
                            Ir para a Página de Login
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}


export default function VerificationPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <VerificationComponent />
        </Suspense>
    );
}