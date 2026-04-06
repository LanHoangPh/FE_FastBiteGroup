"use client";

import { useState } from "react";
import {
  Settings,
  Monitor,
  Globe,
  Volume2,
  VolumeX,
  Zap,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export default function PreferencesPage() {
  // State for appearance settings
  const [darkMode, setDarkMode] = useState("system");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for language settings
  const [language, setLanguage] = useState("vi");

  // State for sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState([70]);

  // State for performance settings
  const [reducedData, setReducedData] = useState(false);
  const [autoplayMedia, setAutoplayMedia] = useState(true);

  const handleSaveSettings = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Cài đặt tùy chọn đã được lưu");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 dark:from-blue-400 dark:via-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
              Tùy chọn
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-2">
              Tùy chỉnh trải nghiệm sử dụng ứng dụng
            </p>
          </div>
        </div>

        {/* Quick Settings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Chế độ:{" "}
                {darkMode === "system"
                  ? "Hệ thống"
                  : darkMode === "dark"
                  ? "Tối"
                  : "Sáng"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                Ngôn ngữ: {language === "vi" ? "Tiếng Việt" : "English"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Âm thanh: {soundEnabled ? "Bật" : "Tắt"}
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Tiết kiệm: {reducedData ? "Bật" : "Tắt"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
              Giao diện
            </CardTitle>
            <CardDescription>Tùy chỉnh giao diện người dùng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme-mode">Chế độ màu</Label>
              <Select value={darkMode} onValueChange={setDarkMode}>
                <SelectTrigger id="theme-mode">
                  <SelectValue placeholder="Chọn chế độ màu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Sáng</SelectItem>
                  <SelectItem value="dark">Tối</SelectItem>
                  <SelectItem value="system">Theo hệ thống</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-blue-500" />
                  Giảm hiệu ứng chuyển động
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Giảm thiểu các hiệu ứng chuyển động và hoạt ảnh
                </p>
              </div>
              <Switch
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
              Ngôn ngữ
            </CardTitle>
            <CardDescription>Tùy chỉnh ngôn ngữ hiển thị</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                Ngôn ngữ hiển thị
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
              Âm thanh
            </CardTitle>
            <CardDescription>Tùy chỉnh cài đặt âm thanh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-slate-500" />
                  )}
                  Âm thanh thông báo
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Phát âm thanh khi có thông báo mới
                </p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {soundEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Âm lượng</Label>
                  <span className="text-sm text-slate-500">
                    {soundVolume[0]}%
                  </span>
                </div>
                <Slider
                  value={soundVolume}
                  onValueChange={setSoundVolume}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
              Hiệu năng
            </CardTitle>
            <CardDescription>Tối ưu hóa hiệu năng ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Chế độ tiết kiệm dữ liệu
                </Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Giảm lượng dữ liệu sử dụng bằng cách tải hình ảnh ở chất lượng
                  thấp hơn
                </p>
              </div>
              <Switch checked={reducedData} onCheckedChange={setReducedData} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tự động phát media</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tự động phát video và âm thanh khi xem
                </p>
              </div>
              <Switch
                checked={autoplayMedia}
                onCheckedChange={setAutoplayMedia}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
