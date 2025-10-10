'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Crown, Eye, Shield } from 'lucide-react';
import { useState } from 'react';

interface RolePromotionButtonProps {
    currentRole: 'admin' | 'developer' | 'viewer';
    onRoleChange: (newRole: 'admin' | 'developer' | 'viewer') => Promise<void>;
    disabled?: boolean;
}

const roleConfig = {
    admin: {
        label: 'Admin',
        color: 'bg-red-100 text-red-800',
        icon: Crown,
        description: 'Full system access'
    },
    developer: {
        label: 'Developer',
        color: 'bg-blue-100 text-blue-800',
        icon: Shield,
        description: 'API access and development'
    },
    viewer: {
        label: 'Viewer',
        color: 'bg-gray-100 text-gray-800',
        icon: Eye,
        description: 'Read-only access'
    }
};

export default function RolePromotionButton({
    currentRole,
    onRoleChange,
    disabled = false
}: RolePromotionButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleChange = async (newRole: 'admin' | 'developer' | 'viewer') => {
        if (newRole === currentRole || isLoading) return;

        try {
            setIsLoading(true);
            await onRoleChange(newRole);
        } catch (error) {
            console.error('Error changing role:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentConfig = roleConfig[currentRole];
    const CurrentIcon = currentConfig.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || isLoading}
                    className="h-8"
                >
                    <CurrentIcon className="w-3 h-3 mr-1" />
                    <Badge variant="secondary" className={currentConfig.color}>
                        {currentConfig.label}
                    </Badge>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {Object.entries(roleConfig).map(([role, config]) => {
                    const Icon = config.icon;
                    const isCurrentRole = role === currentRole;

                    return (
                        <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(role as 'admin' | 'developer' | 'viewer')}
                            disabled={isCurrentRole || isLoading}
                            className={`cursor-pointer ${isCurrentRole ? 'opacity-50' : ''}`}
                        >
                            <Icon className="w-4 h-4 mr-2" />
                            <div className="flex flex-col">
                                <span className="font-medium">{config.label}</span>
                                <span className="text-xs text-muted-foreground">{config.description}</span>
                            </div>
                            {isCurrentRole && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    Current
                                </Badge>
                            )}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}