'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BellIcon, KeyIcon, Settings2Icon, ShieldIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">
          Configure your Roulix account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <Settings2Icon className="w-5 h-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Your first name" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Your last name" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">
                  Your primary email for important notifications
                </p>
              </div>

              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <Input id="company" placeholder="Your company" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="timezone">Time Zone</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/madrid">Europe/Madrid (GMT+1)</SelectItem>
                    <SelectItem value="america/new_york">America/New York (GMT-5)</SelectItem>
                    <SelectItem value="america/los_angeles">America/Los Angeles (GMT-8)</SelectItem>
                    <SelectItem value="asia/tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <KeyIcon className="w-5 h-5 mr-2" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure your API calls behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="defaultModel">Default Model</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select default model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3">Claude-3</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxTokens">Default Token Limit</Label>
                <Input id="maxTokens" type="number" placeholder="2048" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">
                  Maximum number of tokens for responses (max: 4096)
                </p>
              </div>

              <div>
                <Label htmlFor="temperature">Default Temperature</Label>
                <Input id="temperature" type="number" step="0.1" placeholder="0.7" className="mt-1" />
                <p className="text-xs text-slate-500 mt-1">
                  Controls response creativity (0.0 - 1.0)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-fallback</Label>
                  <p className="text-sm text-slate-600">
                    Automatically switch to another model if one fails
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Detailed Logging</Label>
                  <p className="text-sm text-slate-600">
                    Log detailed request information
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <ShieldIcon className="w-5 h-5 mr-2" />
                Security
              </CardTitle>
              <CardDescription>
                Security and access settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-600">
                    Protect your account with 2FA
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-slate-600">
                    Receive email when you sign in
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div>
                <Label htmlFor="allowedIPs">Allowed IPs (Optional)</Label>
                <Textarea
                  id="allowedIPs"
                  placeholder="192.168.1.100&#10;10.0.0.50&#10;203.0.113.45"
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Restrict API access to specific IPs (one per line)
                </p>
              </div>

              <div>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Revoke All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                  Free Plan
                </Badge>
                <p className="text-sm text-slate-600 mt-2">
                  3 API Keys maximum
                </p>
                <p className="text-sm text-slate-600">
                  10,000 requests/month
                </p>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                This Month&apos;s Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Calls</span>
                    <span>2,847 / 10,000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '28.47%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>124 MB / 1 GB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '12.4%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-slate-900">
                <BellIcon className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Email Alerts</Label>
                  <p className="text-xs text-slate-600">
                    Critical errors
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Usage Alerts</Label>
                  <p className="text-xs text-slate-600">
                    80% of limit reached
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Weekly Reports</Label>
                  <p className="text-xs text-slate-600">
                    Weekly summary
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-900">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Delete All Data
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                Close Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <div className="flex space-x-3">
          <Button variant="outline">
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}