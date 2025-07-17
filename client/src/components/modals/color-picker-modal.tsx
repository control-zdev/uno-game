import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

export function ColorPickerModal({ isOpen, onClose, onColorSelect }: ColorPickerModalProps) {
  const colors = [
    { name: "Red", value: "red", bgClass: "bg-red-500 hover:bg-red-600", icon: "🔴" },
    { name: "Blue", value: "blue", bgClass: "bg-blue-500 hover:bg-blue-600", icon: "🔵" },
    { name: "Green", value: "green", bgClass: "bg-green-500 hover:bg-green-600", icon: "🟢" },
    { name: "Yellow", value: "yellow", bgClass: "bg-yellow-500 hover:bg-yellow-600", icon: "🟡" },
  ];

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bubble border-4 border-spongebob shadow-2xl max-w-md w-full mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cartoon text-deepsea text-center mb-6">
            🌈 Choose a Color 🌈
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 p-4">
          {colors.map((color) => (
            <Button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={`${color.bgClass} text-white py-8 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-lg border-2 border-white`}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-3xl">{color.icon}</span>
                <span>{color.name}</span>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="flex justify-center mt-6 pb-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-deepsea hover:bg-gray-700 text-white border-white px-6 py-2 rounded-full font-semibold"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
