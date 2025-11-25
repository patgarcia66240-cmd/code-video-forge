import { useState } from "react";
import VSCodeLayout from "@/components/VSCodeLayout";
import CodeEditor from "@/components/CodeEditor";
import TypingSimulator from "@/components/TypingSimulator";

const Index = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [code, setCode] = useState(`# Bienvenue dans le simulateur de code
# Ce simulateur reproduit l'écriture de code en temps réel

def fibonacci(n):
    """Calcule la suite de Fibonacci"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Exemple d'utilisation
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

class DataProcessor:
    def __init__(self, data):
        self.data = data
    
    def process(self):
        """Traite les données"""
        return [x * 2 for x in self.data]

# Instance et utilisation
processor = DataProcessor([1, 2, 3, 4, 5])
result = processor.process()
print(f"Résultat: {result}")
`);

  const [onSettingsClick, setOnSettingsClick] = useState<(() => void) | undefined>(undefined);

  return (
    <VSCodeLayout onSettingsClick={onSettingsClick}>
      {!isSimulating ? (
        <CodeEditor code={code} setCode={setCode} onStartSimulation={() => setIsSimulating(true)} />
      ) : (
        <TypingSimulator 
          code={code} 
          onComplete={() => setIsSimulating(false)}
          onSettingsReady={setOnSettingsClick}
        />
      )}
    </VSCodeLayout>
  );
};

export default Index;
