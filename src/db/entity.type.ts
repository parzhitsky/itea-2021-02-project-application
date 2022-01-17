import type WithTimestamps from "./with-timestamps.type";

export default interface Entity extends WithTimestamps {
	id: string;
}
