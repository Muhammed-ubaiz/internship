import React, { Component } from "react";

class LiveClockUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      is24Hour: false,
    };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ date: new Date() });
  }

  render() {
    const { date, is24Hour } = this.state;
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const isPm = hours >= 12;

    if (!is24Hour) {
      hours = hours % 12 || 12;
    }
    const displayHours = hours.toString().padStart(2, "0");

    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        {/* Main Clock Face - Matching your image exactly */}
        <div className="relative bg-white w-full h-full max-h-[250px] rounded-xl shadow-inner flex items-center justify-center overflow-hidden border border-gray-300">
          
          

          {/* Top Right Decoration Circles */}
          <div className="absolute top-3 right-3 flex gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-blue-900"></div>
            <div className="w-6 h-6 rounded-full bg-blue-900"></div>
          </div>

          {/* Time Container */}
          <div className="flex items-center">
            {/* Hours */}
            <div className="text-7xl md:text-8xl font-black text-blue-900 tracking-tighter font-mono">
              {displayHours}
            </div>

            {/* Separator Dots */}
            <div className="flex flex-col gap-4 mx-4">
              <div className="w-3 h-3 bg-blue-900 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-900 rounded-full animate-pulse"></div>
            </div>

            {/* Minutes */}
            <div className="text-7xl md:text-8xl font-black text-blue-900 tracking-tighter font-mono">
              {minutes}
            </div>

            {/* AM/PM Column */}
            {!is24Hour && (
              <div className="ml-3 flex flex-col font-bold text-blue-900 leading-none">
                <span style={{ opacity: isPm ? 0.1 : 1 }} className="text-xl">A</span>
                <span style={{ opacity: isPm ? 1 : 0.1 }} className="text-xl">P</span>
                <span className="text-sm border-t border-blue-200 mt-1">M</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default LiveClockUpdate;