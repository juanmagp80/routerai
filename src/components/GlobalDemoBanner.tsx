import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, TestTube } from "lucide-react";

export function GlobalDemoBanner() {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                    <TestTube className="w-4 h-4" />
                    <span className="font-medium">Portfolio Demo</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        Test Mode
                    </Badge>
                    <span className="hidden sm:inline">
                        This is a demonstration SaaS built for portfolio purposes
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <a
                        href="https://github.com/juanmagp80"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-200 transition-colors"
                    >
                        <Github className="w-4 h-4" />
                    </a>
                    <a
                        href="https://linkedin.com/in/juanmagp80"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-200 transition-colors"
                    >
                        <Linkedin className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}