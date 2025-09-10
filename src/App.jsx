import React, { useState, useRef, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  ResponsiveContainer,
  ReferenceLine,
  Label
} from 'recharts';
import { historicalData } from './data';

const App = () => {
  const [isTooltipActive, setIsTooltipActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640); // Tailwind "sm"
    handleResize(); // run once
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOutsideClick = (event) => {
    if (chartRef.current && !chartRef.current.contains(event.target)) {
      setIsTooltipActive(false);
    }
  };

  const handleChartInteraction = () => {
    setIsTooltipActive(true);
  };

  const colors = {
    Biomass: '#799735',
    Coal: '#000000',
    Gas: '#fe981f',
    Hydro: '#1717ff',
    Solar: '#ffc738', 
    Wind: '#8cd5eb', 
    Geothermal: '#a7cc61',
    // Geothermal: '#bde66d',
    Oil: '#525252',
    'Other Fossil': '#171717',
  };

  const historicalKeys = ['Coal', 'Gas', 'Hydro', 'Other Fossil', 'Biomass', 'Solar', 'Wind'];
  const futureKeys = ['Coal', 'Gas', 'Hydro', 'Geothermal', 'Oil', 'Biomass', 'Solar', 'Wind'];
  const displayOrder = ['Wind', 'Solar', 'Biomass', 'Other Fossil', 'Hydro', 'Geothermal', 'Oil', 'Gas', 'Coal'];

  const CustomLegend = () => {
    return (
      <div className="md:w-52 w-full h-auto mt-6 md:mt-0 md:flex md:flex-col md:items-center md:justify-center">
        <h3 className="text-base font-semibold mb-4 tracking-wide">
          Energy Source
        </h3>
        <div className="flex flex-wrap md:flex-col md:gap-2 gap-3">
          {displayOrder.map((key) => (
            <div key={key} className="flex items-center">
              <div
                className="md:w-5 md:h-5 w-3 h-3 md:mr-2 mr-1"
                style={{ backgroundColor: colors[key], opacity: 0.8 }}
              ></div>
              <span className="text-sm">{key}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const keys = data.isFuture ? futureKeys : historicalKeys;
      const orderedKeys = displayOrder.filter(key => keys.includes(key));
      return (
        <div className="bg-white p-4 border rounded shadow text-sm md:text-base">
          <p className="font-bold">{`Year: ${label}`}</p>
          {orderedKeys.map((key) =>
            data[key] ? (
              <p key={key} style={{ color: colors[key] }}>
                {`${key}: ${data[key].toFixed(2)} TWh`}
              </p>
            ) : null
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100 p-2"
      onClick={handleOutsideClick}
      onTouchStart={handleOutsideClick}
    >
      <div className="p-2 w-full max-w-5xl focus:outline-none" ref={chartRef}>
        <div
          className="flex flex-col md:flex-row justify-center md:space-x-14"
          onMouseMove={handleChartInteraction}
          onTouchStart={handleChartInteraction}
        >
          <div className="w-full h-72 md:h-[500px] overflow-x-auto">
            <div className="max-md:min-w-[500px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={historicalData} className="focus:outline-none" 
                margin={{left: 50}}
                >
                  <CartesianGrid />
                  <XAxis
                    dataKey="year"
                    domain={[2000, 2035]}
                    ticks={[2000, 2005, 2010, 2015, 2020, 2030, 2035]}
                    tickFormatter={(tick) =>
                      [2005, 2015, 2025].includes(tick) ? '' : tick
                    }
                    type="number"
                    interval={0}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis
                    label={{
                      value: 'Electricity Generation  (TWh)',
                      angle: -90,
                      position: 'outsideLeft',
                      offset: 80,
                      dx: -40,
                      fontSize: 18,
                      color: 'black',
                    }}
                    ticks={[0, 100, 200, 300, 400]}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    isAnimationActive={isTooltipActive}
                  />
                  {historicalKeys.map((key) => (
                    <Area
                      key={key}
                      name={key}
                      type="monotone"
                      dataKey={(data) => (data.isFuture ? null : data[key])}
                      stackId="historical"
                      stroke="transparent"
                      fill={colors[key]}
                      fillOpacity={0.8}
                    />
                  ))}
                  {futureKeys.map((key) => (
                    <Bar
                      key={key}
                      name={key}
                      dataKey={(data) => (data.isFuture ? data[key] : null)}
                      fill={colors[key]}
                      fillOpacity={0.8}
                      stackId="future"
                      barSize={10}
                    />
                  ))}

                  <ReferenceLine x={2030} stroke="none">
                    <Label
                      value="High Ambition"
                      position="top"
                      fontSize={isMobile ? 10 : 16}
                      fill="black"
                      dy={isMobile ? 110 : 170}
                      dx={isMobile ? 2 : 5}
                      angle={-90}
                      textAnchor="middle"
                      fontWeight="bold"
                      style={{ letterSpacing: "1px" }}
                    />
                  </ReferenceLine>


                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>


          <CustomLegend />
        </div>
      </div>
    </div>
  );
};

export default App;