"use client"
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card"
import { SolanaState } from "@/components/solana/solana-state"
import { useEffect, useCallback, useState, useMemo } from "react"
import { Separator } from "@radix-ui/react-separator"
import { getCreatorAddress, withdrawDripcastAccountBalance } from "@/modules/solana/creator"
import { Wallet, WalletContextState } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import  {BanknoteArrowDown, RotateCw} from "lucide-react"


export const AccountSection = () => {
    const [wallet,setWallet] = useState<WalletContextState | null>(null)
    const [balance,setBalance] = useState(0)
    const [dripcastAccountBalance,setDripcastAccountBalance] = useState(0)
    const [refreshing,setRefreshing] = useState(0)
    useEffect(()=>{
        let timeout =0
        const checkWallet = ()=>{
            console.log("wallet", SolanaState.wallet)  
            if(SolanaState.wallet){
                setWallet(SolanaState.wallet)
            }else{
                timeout = window.setTimeout(()=>{
                    checkWallet()
                },300)
            }
        }
        timeout = window.setTimeout(()=>{
            checkWallet()
        },300)
        return ()=>{
            clearTimeout(timeout)
        }
    },[wallet,refreshing])


    const addressOfAccount = useMemo(()=>{
        console.log("addressOfAccount", wallet?.publicKey)  
        if(wallet?.publicKey){
            return getCreatorAddress(wallet.publicKey)
        }
        return null
    },[wallet,refreshing])
    
        
    const getBalance = async () => {
        if(wallet?.publicKey){
            const balance = await SolanaState.connection?.getBalance(wallet.publicKey)
            setBalance(balance ?? 0)
        }
    }
    const getDripcastAccountBalance = async () => {
        if(addressOfAccount){
            const balance = await SolanaState.connection?.getBalance(addressOfAccount)
            setDripcastAccountBalance(balance ?? 0)
        }
    }
    useEffect(()=>{
        if(wallet?.publicKey){
            getBalance()
            getDripcastAccountBalance()
        }
    },[wallet,refreshing])

    return (
        <div className="flex flex-col justify-start items-start gap-y-2">
           
            <Card className="bg-secondary" >
                <CardHeader>
                    <CardTitle className="flex item">Wallet  <Button variant="ghost" size="icon"  onClick={()=>{
                                setRefreshing(refreshing+1)
                            }}><RotateCw  /></Button></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground"> 
                                Address
                            </span>
                            <span className="text-sm font-medium">
                               {wallet?.publicKey?.toBase58()?.slice(0, 6) + '...' }
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground"> 
                                Balance
                            </span>
                            <span className="text-sm font-medium">
                                {balance}
                            </span>
                        </div>
                       
                    </div>
                   
                    
                </CardContent>
            </Card> 
            <Separator className="my-2"></Separator>

            <Card className="bg-secondary" >
                <CardHeader>
                    <CardTitle>DripCast Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground"> 
                                Address 
                            </span>
                            <span className="text-sm font-medium">
                               { `${addressOfAccount}` }
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground"> 
                                Balance
                            </span>
                            <span className="text-sm font-medium">
                                {dripcastAccountBalance}
                            </span>
                        </div>
                        <div className="flex items-center mt-4">
                            <Button  disabled={dripcastAccountBalance === 0} onClick={
                                async ()=>{
                                    if(wallet?.publicKey){
                                        await withdrawDripcastAccountBalance(dripcastAccountBalance)
                                    }
                                }
                            }>
                               <BanknoteArrowDown></BanknoteArrowDown> Withdrawl to your wallet
                            </Button>
                        </div>
                    </div>

                    
                </CardContent>
            </Card> 

          
        </div>
    )
}