'use server'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout () {
    try {
        const cookieStore = cookies('');
        cookieStore.delete('token') ;
        redirect('/')
    } catch (error) {
        console.error('erro ao efetuar logout: ', error)
    }
    
    
};