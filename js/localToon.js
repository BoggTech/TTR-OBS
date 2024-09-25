const ENDPOINT = "info.json"
const URL = "localhost"
const VALID_TRACKS = ["Toon-Up", "Trap", "Lure", "Sound", "Throw", "Squirt", "Drop"]

function isValidTrack(track) {
    return VALID_TRACKS.includes(track);
}

class ToonData {
    constructor(port, token, user_agent) {
        this.port = port;
        this.token = token;
        this.user_agent = user_agent;
        this.data = null;
    }

    async updateData(auth=this.token) {
        const url = `http://${URL}:${this.port}/${ENDPOINT}`;
        const headers = {"X-Requested-With": this.user_agent, 
                        "Authorization": auth, 
                        "Connection": 'close'}
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw {message: `HTTP error ${response.status}`, code:response.status};
            }
            this.data = await response.json();
        } catch (error) {
            // todo: something... maybe...?
            console.log(error);
            throw(error);
        }
    }

    getName() {
        if (this.data == null) return null;
        return this.data.toon.name;
    }

    getSpecies() {
        if (this.data == null) return null;
        return this.data.toon.species;
    }

    getHeadColor() {
        if (this.data == null) return null;
        return this.data.toon.headColor;
    }

    getStyle() {
        if (this.data == null) return null;
        return this.data.toon.style;
    }

    getCurrentLaff() {
        if (this.data == null) return null;
        return this.data.laff.current;
    }

    getMaxLaff() {
        if (this.data == null) return null;
        return this.data.laff.max;
    }

    getZone() {
        if (this.data == null) return null;
        return this.data.location.zone;
    }

    getNeighborhood() {
        if (this.data == null) return null;
        return this.data.location.neighborhood;
    }

    getDistrict() {
        if (this.data == null) return null;
        return this.data.location.district;
    }

    hasTrack(track) {
        if (this.data == null || !isValidTrack(track)) return null;
        try {
            return (this.data.gags[track] != null);
        } 
        catch (error) {
            return false;
        }
    }

    getHighestGagLevel(track) {
        if (this.data == null || !isValidTrack(track)) return null; 
        if (!this.hasTrack(track)) return 0;
        return this.data.gags[track].gag.level;
    }

    getHighestGagName(track) {
        if (this.data == null || !this.hasTrack(track)) return null;
        return this.data.gags[track].gag.name;
    }

    hasAnyOrganic(track) {
        return (this.getHighestOrganicLevel(track) != 0 && this.getHighestOrganicLevel(track) != null);
    }

    getHighestOrganicLevel(track) {
        if (this.data == null || !isValidTrack(track)) return null;
        if ( this.hasTrack(track) && this.data.gags[track].organic != null ) {
            return this.data.gags[track].organic.level
        } else {
            return 0;
        }
    }

    getHighestOrganicName(track) {
        if (this.data == null || !isValidTrack(track)) return null;
        if ( this.hasTrack(track) && this.data.gags[track].organic != null ) {
            return this.data.gags[track].organic.name
        } else {
            return null;
        }
    }

    hasAnyOrganic(track) {
        return this.getHighestOrganicName(track) != null
    }

    getCurrentExperience(track) {
        if (this.data == null || !this.hasTrack(track) ) return null;
        return this.data.gags[track].experience.current
    }

    getNextExperience(track) {
        if (this.data == null || !this.hasTrack(track) ) return null;
        return this.data.gags[track].experience.next
    }

    hasTaskInSlot(slot) {
        // this doesn't "technically" line up with the in-game tasks, but that isn't given to us by the api.
        if (this.data == null) return null
        return slot < this.data.tasks.length
    }

    getTaskObjective(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.text;
    }

    getTaskLocation(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.where;
    }

    getTaskProgressText(slot) {
        // returns task progress as string, localized.
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.progress.text;
    }

    getCurrentTaskProgress(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.progress.current;
    }

    getCurrentTaskTarget(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.progress.target;
    }

    getTaskFromNpcName(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.name
    }

    getTaskFromNpcBuilding(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.building
    }

    getTaskFromNpcZone(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.zone
    }

    getTaskFromNpcNeighborhood(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.neighborhood
    }

    getTaskToNpcName(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.name
    }

    getTaskToNpcBuilding(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.building
    }

    getTaskToNpcZone(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.zone
    }

    getTaskToNpcNeighborhood(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.neighborhood
    }

    getTaskReward(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].reward
    }

    isTaskDeletable(slot) {
        if (this.data == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].deletable
    }

    hasInvasion() {
        if (this.data == null) return null
        return (!(this.data.invasion == null))
    }

    getInvasionCog() {
        if (this.data == null || !this.hasInvasion()) return null
        return this.data.invasion.cog
    }

    getInvasionQuantity() {
        if (this.data == null || !this.hasInvasion()) return null
        return this.data.invasion.quantity
    }

    isInvasionMega() {
        if (this.data == null) return null
        if (!this.hasInvasion()) return false
        return this.data.invasion.mega
    }
}