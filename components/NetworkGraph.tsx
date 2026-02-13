
import React, { useEffect, useRef, useState } from 'react';
import { PrimaryAgent } from '../types';

interface NetworkGraphProps {
  agents: PrimaryAgent[];
  activeAgentId: string | null;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ agents, activeAgentId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<any | null>(null);
  const d3Ref = useRef<any>(null);
  const [isD3Ready, setIsD3Ready] = useState(false);

  // Dynamically load D3 to avoid JS loader timeouts for large libraries
  useEffect(() => {
    let mounted = true;
    import('d3').then((mod) => {
        if (mounted) {
            d3Ref.current = mod.default || mod;
            setIsD3Ready(true);
        }
    }).catch(err => {
        console.warn("Failed to load D3 visualization library", err);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isD3Ready || !d3Ref.current || !svgRef.current || !agents) return;
    
    const d3 = d3Ref.current;
    const width = 300;
    const height = 300;
    const svg = d3.select(svgRef.current);
    
    let linkGroup = svg.select(".links");
    let nodeGroup = svg.select(".nodes");
    
    if (linkGroup.empty()) {
        linkGroup = svg.append("g").attr("class", "links");
        nodeGroup = svg.append("g").attr("class", "nodes");
    }

    // 1. Prepare Data & Persist Positions
    const oldNodes = new Map<string, any>(
        simulationRef.current 
            ? simulationRef.current.nodes().map((d: any) => [d.id, d]) 
            : []
    );

    const nodes: any[] = [{ id: 'Orchestrator', group: 'core' }];
    const links: any[] = [];

    agents.forEach((agent) => {
      nodes.push({ 
          id: agent.id, 
          group: 'primary', 
          active: agent.id === activeAgentId, 
          status: agent.status 
      });
      links.push({ source: 'Orchestrator', target: agent.id, type: 'primary' });
      
      if (agent.id === activeAgentId && agent.sub_agents) {
        const sortedSubAgents = [...agent.sub_agents].sort((a, b) => {
            const score = (s: string) => s === 'working' ? 2 : s === 'success' ? 1 : 0;
            return score(b.status || 'idle') - score(a.status || 'idle');
        });

        sortedSubAgents.slice(0, 6).forEach(sub => {
          nodes.push({ id: sub.id, group: 'sub', status: sub.status });
          links.push({ source: agent.id, target: sub.id, type: 'sub' });
        });
      }
    });

    // Merge old state into new nodes
    nodes.forEach(node => {
        const old = oldNodes.get(node.id);
        if (old) {
            node.x = old.x;
            node.y = old.y;
            node.vx = old.vx;
            node.vy = old.vy;
        }
    });

    // 2. Initialize or Update Simulation
    if (!simulationRef.current) {
        simulationRef.current = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance((d: any) => d.type === 'primary' ? 80 : 45))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(20));
        
        simulationRef.current.on("tick", ticked);
    } else {
        simulationRef.current.nodes(nodes);
        const linkForce = simulationRef.current.force("link");
        if (linkForce) {
             linkForce.links(links);
        }
        simulationRef.current.alpha(0.3).restart();
    }

    // 3. D3 Update Pattern
    const link = linkGroup.selectAll("line")
        .data(links, (d: any) => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            return `${sourceId}-${targetId}`;
        });

    link.exit().remove();

    const linkEnter = link.enter().append("line")
        .attr("stroke", "#475569")
        .attr("stroke-width", (d: any) => d.type === 'primary' ? 1.5 : 0.5)
        .attr("stroke-opacity", (d: any) => d.type === 'primary' ? 0.6 : 0.3);

    const linkMerge = linkEnter.merge(link);

    const node = nodeGroup.selectAll("circle")
        .data(nodes, (d: any) => d.id);

    node.exit()
        .transition().duration(300)
        .attr("r", 0)
        .remove();

    const nodeEnter = node.enter().append("circle")
        .attr("r", 0)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

    nodeEnter.merge(node)
        .attr("class", (d: any) => d.status === 'working' ? "node-working" : "node-success")
        .transition().duration(500)
        .attr("r", (d: any) => d.group === 'core' ? 8 : d.group === 'primary' ? 6 : 4)
        .attr("fill", (d: any) => {
            if (d.group === 'core') return '#f59e0b';
            if (d.active) return '#0ea5e9';
            if (d.group === 'primary') return '#475569';
            if (d.status === 'working') return '#fbbf24';
            if (d.status === 'success') return '#10b981';
            return '#64748b';
        })
        .attr("stroke", (d: any) => {
             if (d.active) return "#0ea5e9";
             if (d.status === 'working') return "#fbbf24";
             if (d.status === 'success') return "#10b981";
             return "#fff";
        });

    function ticked() {
        linkMerge
            .attr("x1", (d: any) => d.source.x)
            .attr("y1", (d: any) => d.source.y)
            .attr("x2", (d: any) => d.target.x)
            .attr("y2", (d: any) => d.target.y);

        nodeEnter.merge(node)
            .attr("cx", (d: any) => Math.max(5, Math.min(width - 5, d.x)))
            .attr("cy", (d: any) => Math.max(5, Math.min(height - 5, d.y)));
    }

    function dragstarted(event: any) {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
        if (!event.active) simulationRef.current?.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    return () => {
        if (simulationRef.current) {
            simulationRef.current.stop();
        }
    };

  }, [agents, activeAgentId, isD3Ready]);

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 300 300" className="overflow-visible" />
  );
};

export default NetworkGraph;
