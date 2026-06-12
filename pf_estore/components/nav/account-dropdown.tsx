"use client";

import { useState } from "react";
import Link from "next/link"

export default function AccountDropdown({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>
                {user ? user.email : "Account"}
            </button>
            {isOpen && (
                        <div>
                            <Link href="/account/orders">Order History</Link>
                        </div>
            )}
        </div>
    );
}