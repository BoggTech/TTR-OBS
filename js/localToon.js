const URL = "localhost";
const VALID_TRACKS = ["Toon-Up", "Trap", "Lure", "Sound", "Throw", "Squirt", "Drop"];
const VALID_ENDPOINTS = ["info", "toon", "laff", "location", "gags", "tasks", "invasion", "fish", "flowers", "cogsuits", "golf", "racing"];
const MAX_FISH = 70;
const MAX_FLOWERS = 40;
const DEPARTMENT_NAMES = {"bossbot": "c", "lawbot": "l", "cashbot": "m", "sellbot": "s"}
const DEPARTMENT_CHARS = ["c", "l", "m", "s"]

function isValidTrack(track) {
    return VALID_TRACKS.includes(track);
}

class ToonData {
    constructor(port, token, user_agent) {
        this.port = port;
        this.token = token;
        this.user_agent = user_agent;
        this.data = {};
        for ( let i = 0; i < VALID_ENDPOINTS.length; i++ ) {
            this.data[VALID_ENDPOINTS[i]] = null;
        }
    }

    async updateAll() {
        // Not recommended to do this, use what you need
        const promises = [];
        try {
            for ( let i = 0; i < VALID_ENDPOINTS.length; i++ ) {
                promises.push(await this.updateData({endpoint:VALID_ENDPOINTS[i]}))
            }
            Promise.allSettled(promises);
        } catch (error) {
            console.log(error);
            throw(error);
        }
    }

    async updateData({auth=this.token, endpoint="info"}) {
        let url = `http://${URL}:${this.port}/${endpoint}.json`;
        let headers = {"X-Requested-With": this.user_agent, 
                        "Authorization": auth, 
                        "Connection": 'close'}
        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw {message: `HTTP error ${response.status}`, code:response.status};
            }
            this.data[endpoint] = await response.json();
        } catch (error) {
            // todo: something... maybe...?
            console.log(error);
            throw(error);
        }
    }

    getName() {
        if (this.data.toon == null) return null;
        return this.data.toon.name;
    }

    getSpecies() {
        if (this.data.toon == null) return null;
        return this.data.toon.species;
    }

    getHeadColor() {
        if (this.data.toon == null) return null;
        return this.data.toon.headColor;
    }

    getStyle() {
        if (this.data.toon == null) return null;
        return this.data.toon.style;
    }

    getCurrentLaff() {
        if (this.data.laff == null) return null;
        return this.data.laff.current;
    }

    getMaxLaff() {
        if (this.data.laff == null) return null;
        return this.data.laff.max;
    }

    getZone() {
        if (this.data.location == null) return null;
        return this.data.location.zone;
    }

    getNeighborhood() {
        if (this.data.location == null) return null;
        return this.data.location.neighborhood;
    }

    getDistrict() {
        if (this.data.location == null) return null;
        return this.data.location.district;
    }

    hasTrack(track) {
        if (this.data.gags == null || !isValidTrack(track)) return null;
        try {
            return (this.data.gags[track] != null);
        } 
        catch (error) {
            return false;
        }
    }

    getHighestGagLevel(track) {
        if (this.data.gags == null || !isValidTrack(track)) return null; 
        if (!this.hasTrack(track)) return 0;
        return this.data.gags[track].gag.level;
    }

    getHighestGagName(track) {
        if (this.data.gags == null || !this.hasTrack(track)) return null;
        return this.data.gags[track].gag.name;
    }

    hasAnyOrganic(track) {
        return (this.getHighestOrganicLevel(track) != 0 && this.getHighestOrganicLevel(track) != null);
    }

    getHighestOrganicLevel(track) {
        if (this.data.gags == null || !isValidTrack(track)) return null;
        if ( this.hasTrack(track) && this.data.gags[track].organic != null ) {
            return this.data.gags[track].organic.level
        } else {
            return 0;
        }
    }

    getHighestOrganicName(track) {
        if (this.data.gags == null || !isValidTrack(track)) return null;
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
        if (this.data.gags == null || !this.hasTrack(track) ) return null;
        return this.data.gags[track].experience.current
    }

    getNextExperience(track) {
        if (this.data.gags == null || !this.hasTrack(track) ) return null;
        return this.data.gags[track].experience.next
    }

    hasTaskInSlot(slot) {
        // this doesn't "technically" line up with the in-game tasks, but that isn't given to us by the api.
        if (this.data.tasks == null) return null
        return slot < this.data.tasks.length
    }

    getTaskObjective(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.text;
    }

    getTaskLocation(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.where;
    }

    getTaskProgressText(slot) {
        // returns task progress as string, localized.
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.progress.text;
    }

    getCurrentTaskProgress(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.progress.current;
    }

    getCurrentTaskTarget(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].objective.progress.target;
    }

    getTaskFromNpcName(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.name
    }

    getTaskFromNpcBuilding(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.building
    }

    getTaskFromNpcZone(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.zone
    }

    getTaskFromNpcNeighborhood(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].from.neighborhood
    }

    getTaskToNpcName(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.name
    }

    getTaskToNpcBuilding(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.building
    }

    getTaskToNpcZone(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.zone
    }

    getTaskToNpcNeighborhood(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].to.neighborhood
    }

    getTaskReward(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].reward
    }

    isTaskDeletable(slot) {
        if (this.data.tasks == null || !this.hasTaskInSlot(slot)) return null
        return this.data.tasks[slot].deletable
    }

    hasInvasion() {
        if (this.data.invasion == null) return null
        return (!(this.data.invasion == null))
    }

    getInvasionCog() {
        if (this.data.invasion == null || !this.hasInvasion()) return null
        return this.data.invasion.cog
    }

    getInvasionQuantity() {
        if (this.data.invasion == null || !this.hasInvasion()) return null
        return this.data.invasion.quantity
    }

    isInvasionMega() {
        if (this.data.invasion == null) return null
        if (!this.hasInvasion()) return false
        return this.data.invasion.mega
    }

    getMaxFishCount() {
        return MAX_FISH;
    }

    getCaughtFishCount() {
        if (this.data.fish == null) return null;
        let size = 0;
        Object.keys(this.data.fish).forEach((key) => {
            size += Object.keys(this.data.fish[key].album).length;
        })
        return size;
    }

    getCaughtFish() {
        // returns an array of all the fish you own
        if (this.data.fish == null) return null;
        let arr = [];
        Object.keys(this.data.fish).forEach((key) => {
            Object.keys(this.data.fish[key].album).forEach((key_2) => {
                arr.push(this.data.fish[key].album[key_2].name);
            });
        })
        return arr;
    }

    getCaughtFishByID(id) {
        // returns an array of fish you own by id
        if (this.data.fish == null) return null;
        let arr = [];
        if (!(id in this.data.fish)) return arr;
        Object.keys(this.data.fish[id].album).forEach((key) => {
            arr.push(this.data.fish[id].album[key].name);
        });
        return arr;
    }

    getBalloonFish() {
        return this.getCaughtFishByID("0");
    }

    getCatFish() {
        return this.getCaughtFishByID("2");
    }

    getClownFish() {
        return this.getCaughtFishByID("4");
    }

    getFrozenFish() {
        return this.getCaughtFishByID("6");
    }

    getStarFish() {
        return this.getCaughtFishByID("8");
    }

    getHoleyMackerel() {
        return this.getCaughtFishByID("10");
    }

    getDogFish() {
        return this.getCaughtFishByID("12");
    }

    getAmoreEel() {
        return this.getCaughtFishByID("14");
    }

    getNurseShark() {
        return this.getCaughtFishByID("16");
    }

    getKingCrab() {
        return this.getCaughtFishByID("18");
    }

    getMoonFish() {
        return this.getCaughtFishByID("20");
    }

    getSeaHorse() {
        return this.getCaughtFishByID("22");
    }

    getPoolShark() {
        return this.getCaughtFishByID("24");
    }

    getBearAcuda() {
        return this.getCaughtFishByID("26");
    }

    getCutThroatTrout() {
        return this.getCaughtFishByID("28");
    }

    getPianoTuna() {
        return this.getCaughtFishByID("30");
    }

    getPBJFish() {
        return this.getCaughtFishByID("32");
    }

    getDevilRay() {
        return this.getCaughtFishByID("34");
    }

    getRecordByName(name) {
        // function that grabs the record for a fish by its name
        // cycle through every fish until we find one that matches the name
        let lowerName = name.toLowerCase();
        if (this.data.fish == null) return null;

        for ( const key of Object.keys(this.data.fish) ) {
            let album = this.data.fish[key].album;
            for ( const key_2 of Object.keys(album) ) {
                if ( lowerName == album[key_2].name.toLowerCase() ) {
                    return album[key_2].weight;
                };
            };
        };

        return null;
    } 

    getMaxFlowerCount() {
        return MAX_FLOWERS;
    }

    getCollectedFlowerCount() {
        if (this.data.flowers == null) return null;
        let size = 0;
        for ( const key of Object.keys(this.data.flowers) ) {
            size += Object.keys(this.data.flowers[key].album).length;
        }
        return size;
    }

    getCollectedFlowers() {
        // returns an array of all the flowers you own
        if (this.data.flowers == null) return null;
        let arr = [];
        for ( const key of Object.keys(this.data.flowers) ) {
            for ( const key_2 of Object.keys(this.data.flowers[key].album) ) {
                arr.push(this.data.flowers[key].album[key_2])
            }
        }
        return arr;
    }

    getCollectedFlowersByID(id) {
        // returns an array of flowers you own by id
        if (this.data.flowers == null) return null;
        let arr = [];
        if (!(id in this.data.flowers)) return arr;
        for ( const key of Object.keys(this.data.flowers[id].album) ) {
            arr.push(this.data.flowers[id].album[key]);
        }
        return arr;
    }

    getDaisies() {
        return this.getCollectedFlowersByID("49");
    }

    getTulips() {
        return this.getCollectedFlowersByID("50");
    }

    getCarnations() {
        return this.getCollectedFlowersByID("51");
    }

    getLilies() {
        return this.getCollectedFlowersByID("52");
    }

    getDaffodils() {
        return this.getCollectedFlowersByID("53");
    }

    getPansies() {
        return this.getCollectedFlowersByID("54");
    }

    getPetunias() {
        return this.getCollectedFlowersByID("55");
    }

    getRoses() {
        return this.getCollectedFlowersByID("56");
    }

    departmentStringToChar(department) {
        let dept = department;

        if (department.length > 1) {
            if (!(department.toLowerCase() in DEPARTMENT_NAMES)) return null;
            dept = DEPARTMENT_NAMES[department];
        } else {
            if (!(department.toLowerCase in DEPARTMENT_CHARS)) return null;
        }
        return dept;
    }

    hasDisguise(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || dept == null) return null;
        dept = department;
        if (department.length > 1) {
            if (!(department.toLowerCase() in DEPARTMENT_NAMES)) return null;
            dept = DEPARTMENT_NAMES[department];
        }
        return this.data.cogsuits[dept].hasDisguise;
    }

    getDisguiseName(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || !this.hasDisguise(department) || dept == null) return null;
        return this.data.cogsuits[dept].suit.name;
    }

    getDisguiseID(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || !this.hasDisguise(department) || dept == null) return null;
        return this.data.cogsuits[dept].suit.name;
    }

    isVersionTwoDisguise(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || !this.hasDisguise(department) || dept == null) return null;
        return this.data.cogsuits[dept].version == "2";
    }

    getDisguiseLevel(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || !this.hasDisguise(department) || dept == null) return null;
        return this.data.cogsuits[dept].level;
    }

    getPromotionTarget(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || !this.hasDisguise(department) || dept == null) return null;
        return this.data.cogsuits[dept].promotion.target;
    }

    getPromotionProgress(department) {
        let dept = this.departmentStringToChar(department);
        if (this.data.cogsuits == null || !this.hasDisguise(department) || dept == null) return null;
        return this.data.cogsuits[dept].promotion.current;
    }

    getGolfStatByName(stat) {
        let name = stat.toLowerCase();
        if (this.data.golf == null) return null;
        for ( const entry of this.data.golf ) {
            if ( entry.name.toLowerCase() == name ) {
                return entry.num;
            }
        }
        // didn't find it!
        return null;
    }

    getAllGolfStatNames() {
        if (this.data.golf == null) return null;
        const arr = [];
        for ( const entry of this.data.golf ) {
            arr.push(entry.name);
        }
        return arr;
    }

    getRacingStatByName(stat) {
        let name = stat.toLowerCase();
        if (this.data.racing == null) return null;
        for ( const entry of this.data.racing ) {
            if ( entry.name.toLowerCase() == name ) {
                return entry.num;
            }
        }
        // didn't find it!
        return null;
    }

    getAllRacingStatNames() {
        if (this.data.racing == null) return null;
        const arr = [];
        for ( const entry of this.data.racing ) {
            arr.push(entry.name);
        }
        return arr;
    }
}