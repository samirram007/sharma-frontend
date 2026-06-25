import type { DeliveryVehicle } from "@/features/modules/delivery_vehicle/data/schema";
import type { Distributor } from "@/features/modules/distributor/data/schema";
import type { Supplier } from "@/features/modules/supplier/data/schema";
import type { Transporter } from "@/features/modules/transporter/data/schema";
import { useState, type ReactNode } from "react";

import React, { createContext } from "react";
interface GlobalContextType {
    transporter: Transporter | null;
    setTransporter: (value: Transporter | null) => void;
    deliveryVehicle: DeliveryVehicle | null;
    setDeliveryVehicle: (value: DeliveryVehicle | null) => void;
    distributor: Distributor | null;
    setDistributor: (value: Distributor | null) => void;
    supplier: Supplier | null;
    setSupplier: (value: Supplier | null) => void;
};
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);



export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
    const [transporter, setTransporter] = useState<Transporter | null>(null);
    const [deliveryVehicle, setDeliveryVehicle] = useState<DeliveryVehicle | null>(null);
    const [distributor, setDistributor] = useState<Distributor | null>(null);
    const [supplier, setSupplier] = useState<Supplier | null>(null);

    return (
        <GlobalContext.Provider
            value={{
                transporter,
                setTransporter,
                deliveryVehicle,
                setDeliveryVehicle,
                distributor,
                setDistributor,
                supplier,
                setSupplier,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = React.useContext(GlobalContext);
    if (context === undefined) {
        throw new Error("useGlobalContext must be used within a GlobalContextProvider");
    }
    return context;
};