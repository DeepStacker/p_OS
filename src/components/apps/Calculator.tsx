import React, { useState } from "react";
import { useSystem } from "@/contexts/SystemContext";
import { cn } from "@/lib/utils";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [formula, setFormula] = useState("");
  const [lastOp, setLastOp] = useState<string | null>(null);

  const handleNumber = (n: string) => {
    if (display === "0" || lastOp) {
      setDisplay(n);
      setLastOp(null);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOperator = (op: string) => {
    setFormula(display + " " + op + " ");
    setLastOp(op);
  };

  const calculate = () => {
    try {
      const result = eval(formula + display);
      setDisplay(String(result));
      setFormula("");
      setLastOp(null);
    } catch {
      setDisplay("Error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1D1D1F] p-4 text-white select-none">
      <div className="h-20 flex flex-col items-end justify-end px-4 pb-4">
        <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{formula}</div>
        <div className="text-4xl font-light tracking-tighter truncate w-full text-right">{display}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        {["AC", "±", "%", "÷"].map((btn, i) => (
          <button 
            key={btn}
            onClick={() => btn === "AC" ? (setDisplay("0"), setFormula("")) : handleOperator(btn === "÷" ? "/" : btn)}
            className="h-12 rounded-full bg-[#3C3C3E] hover:bg-[#505052] font-medium text-sm transition-colors text-zinc-300"
          >
            {btn}
          </button>
        ))}
        {["7", "8", "9", "×"].map((btn) => (
          <button 
            key={btn}
            onClick={() => btn === "×" ? handleOperator("*") : handleNumber(btn)}
            className={cn("h-12 rounded-full font-medium text-sm transition-colors", btn === "×" ? "bg-orange-500 hover:bg-orange-600" : "bg-[#5D5D5F] hover:bg-[#727274]")}
          >
            {btn}
          </button>
        ))}
        {["4", "5", "6", "-"].map((btn) => (
          <button 
            key={btn}
            onClick={() => btn === "-" ? handleOperator("-") : handleNumber(btn)}
            className={cn("h-12 rounded-full font-medium text-sm transition-colors", btn === "-" ? "bg-orange-500 hover:bg-orange-600" : "bg-[#5D5D5F] hover:bg-[#727274]")}
          >
            {btn}
          </button>
        ))}
        {["1", "2", "3", "+"].map((btn) => (
          <button 
            key={btn}
            onClick={() => btn === "+" ? handleOperator("+") : handleNumber(btn)}
            className={cn("h-12 rounded-full font-medium text-sm transition-colors", btn === "+" ? "bg-orange-500 hover:bg-orange-600" : "bg-[#5D5D5F] hover:bg-[#727274]")}
          >
            {btn}
          </button>
        ))}
        <button onClick={() => handleNumber("0")} className="col-span-2 h-12 rounded-full bg-[#5D5D5F] hover:bg-[#727274] font-medium text-sm transition-colors px-6 text-left">0</button>
        <button onClick={() => handleNumber(".")} className="h-12 rounded-full bg-[#5D5D5F] hover:bg-[#727274] font-medium text-sm transition-colors">.</button>
        <button onClick={calculate} className="h-12 rounded-full bg-orange-500 hover:bg-orange-600 font-medium text-sm transition-colors">=</button>
      </div>
    </div>
  );
};

export default Calculator;
