import { LucideIcon } from "lucide-react";
import { Shield, Zap, BarChart3, Layers, Lock } from "lucide-react";


export interface MakesUsDifferent {
    id: number;
    icon: LucideIcon;
    title: string;
    description: string;
}

export const platform: MakesUsDifferent[] = [
    {
id: 1,
icon:Layers,
title: "All-in-One Platform",
description: "From property listings to lease signing, rent collection, and utility management — everything is integrated.",
    }
]

export const automation : MakesUsDifferent[] = [
    {
id: 1,
icon:Zap,
title: "Automation That Works",
description: "Save time with automated bill splitting, invoice generation, and tenant screening.",
    }
]

export const decisions : MakesUsDifferent[] = [

    {
id: 1,
icon:BarChart3,
title: "Data-Driven Decisions",
description: "Our analytics tools help property owners make informed choices and optimize performance.",
    }
]

export const compliance : MakesUsDifferent[] = [

    {
id: 1,
icon:Shield,
title: "Compliance & Security First",
description: "We prioritize secure digital processes and tax compliance to protect both landlords and tenants.",
    }
]

export const financialTools : MakesUsDifferent[] = [
    {
id: 5,
icon:Lock,
title: "Smart Financial Tools",
description: "With Stripe and Plaid integrations, we offer secure, fast, and reliable payment processing and financial verification.",
    },
]