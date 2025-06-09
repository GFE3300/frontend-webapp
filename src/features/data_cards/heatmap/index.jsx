import CustomerHeatmapCard from "./subcomponents/CustomerHeatmapCard";
import { MetricProvider } from "../shared/context/MetricProvider";

const HeatmapCard = () => (
    <MetricProvider>
        <CustomerHeatmapCard />
    </MetricProvider>
);

export default HeatmapCard;