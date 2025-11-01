import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TestTube } from "lucide-react";

export function DemoModeWarning() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <TestTube className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">Demo Mode Active</h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              This is a <strong>demonstration version</strong> for portfolio purposes. 
              All payments are simulated using Stripe's test environment.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <TestTube className="w-3 h-3 mr-1" />
                  Test Mode
                </Badge>
                <span className="text-xs">No real charges will be made</span>
              </div>
              <div className="text-xs text-amber-600">
                Use test card: <code className="bg-amber-100 px-1 rounded">4242 4242 4242 4242</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}