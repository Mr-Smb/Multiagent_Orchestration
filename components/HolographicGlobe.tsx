
import React, { useEffect, useRef, useState } from 'react';

const HolographicGlobe: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: any = null;

    // Dynamically import D3 to prevent loader timeouts
    import('d3').then((d3: any) => {
        if (!mounted || !svgRef.current) return;
        
        // Handle both default export and named exports logic for different CDN bundles
        const d3Instance = d3.default || d3;

        const width = 300;
        const height = 200;
        const svg = d3Instance.select(svgRef.current);
        svg.selectAll("*").remove();

        // Projection
        const projection = d3Instance.geoOrthographic()
          .scale(80)
          .center([0, 0])
          .translate([width / 2, height / 2]);

        const path = d3Instance.geoPath().projection(projection);

        // Globe Gradient
        const defs = svg.append("defs");
        const globeGradient = defs.append("radialGradient")
          .attr("id", "globeGradient")
          .attr("cx", "50%")
          .attr("cy", "50%")
          .attr("r", "50%");
        
        globeGradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "#0ea5e9")
          .attr("stop-opacity", "0.2");
        
        globeGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", "#0284c7")
          .attr("stop-opacity", "0.05");

        // Water/Background
        svg.append("circle")
          .attr("cx", width / 2)
          .attr("cy", height / 2)
          .attr("r", 80)
          .attr("fill", "url(#globeGradient)")
          .attr("stroke", "#0ea5e9")
          .attr("stroke-width", 0.5)
          .attr("stroke-opacity", 0.5);

        // Grid
        const graticule = d3Instance.geoGraticule();
        const grid = svg.append("path")
          .datum(graticule())
          .attr("class", "graticule")
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "#0ea5e9")
          .attr("stroke-width", 0.5)
          .attr("stroke-opacity", 0.15);

        // Animation Loop
        let rotation = 0;
        timer = d3Instance.timer(() => {
          rotation += 0.5;
          projection.rotate([rotation, -15]);
          grid.attr("d", path);
        });

    }).catch(err => {
        console.warn("Failed to load D3 for globe", err);
        if (mounted) setError(true);
    });

    return () => {
      mounted = false;
      if (timer) timer.stop();
    };
  }, []);

  if (error) return null;

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 200" className="overflow-visible" />
  );
};

export default HolographicGlobe;