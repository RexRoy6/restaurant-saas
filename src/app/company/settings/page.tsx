"use client";

import { useState } from "react";
import PageHeader from "@/app/components/crm/PageHeader";
import ChangePasswordForm from "@/app/components/settings/ChangePasswordForm";

export default function SettingsPage() {

    const [showChangePassword, setShowChangePassword] = useState(false);

    return (
        <div>
            <PageHeader
                title="Settings"
                buttonLabel=""
                onClick={() => { }}
            />

            {/* Card / Section */}
            <div
                style={{
                    border: "1px solid #eee",
                    borderRadius: 10,
                    padding: 16,
                    maxWidth: 500,
                }}
            >
                {/* Header clickable */}
                <div
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                >
                    <h3 style={{ margin: 0 }}>Change Password</h3>

                    <span style={{ fontSize: 18 }}>
                        {showChangePassword ? "−" : "+"}
                    </span>
                </div>

                {/* Content */}
                {showChangePassword && (
                    <div style={{ marginTop: 15 }}>
                        <ChangePasswordForm
                            onSuccess={() => setShowChangePassword(false)}
                        />
                    </div>
                )}
            </div>

        </div>
    );
}