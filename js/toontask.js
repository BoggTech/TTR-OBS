const timeout = 3000;
var test;
const token_str = "ttr-token" // where the token is saved in localstorage
const user_agent = "Toontown Rewritten OBS Overlay"

function update_data() {
    test.updateData({endpoint: "tasks"})
    .then(update_toontasks_and_loop)
    .catch((error) => {
        hide_all_scrolls();
        if (error.code == 403) {
            // hey :(...
            localStorage.removeItem(token_str);
            setTimeout(setup_toontask_loop, timeout);
        } else {
            setTimeout(update_data, timeout);
        }
    })
}

function update_toontasks_and_loop() {
    for ( let i = 0; i < 4; i++ ) {
        let element = document.getElementById("task" + i)
        if ( element == null ) {
            // the page we're on is missing this toontask
            continue;
        }

        if ( !test.hasTaskInSlot(i) ) {
            // no task, hide everything
            element.style.display = "none";
        } else {
            jff_indicator = document.getElementById("jff-indicator" + i);
            jff_indicator.style.display = "none";
            if (test.isTaskDeletable(i)) {
                jff_indicator.style.display = "block";
            }
            element.style.display = "block";
            let location = test.getTaskLocation(i);
            let objective = test.getTaskObjective(i);
            
            // SPECIFIC EXCEPTIONS for some task types
            if (objective == "Visit") { // weird. but works. visit tasks only show as "visit", with no location, so lets grab the location ourselves.
                objective = objective + " " + test.getTaskToNpcName(i)
                place = test.getTaskToNpcBuilding(i);
                if (!place)
                    place = test.getTaskToNpcZone(i);
                if (!place)
                    place = test.getTaskToNpcNeighborhood(i);
                location = place;
            } else if (objective == "Play Minigames on the Trolley") {
                // this task type is weird and repeats text
                objective = "Play Minigames"
            }

            document.getElementById("text" + i).textContent = objective;
            document.getElementById("where" + i).textContent = location;
            progress = test.getTaskProgressText(i);
            if ( progress && progress != "Not chosen" ) { // hide the bar if there's no progress string OR if they want us to choose a gag (choose task does not return nothing)
                let current = test.getCurrentTaskProgress(i);
                let target = test.getCurrentTaskTarget(i);
                let percent = Math.max(0, Math.min(1, current/target))
                if ( target < 1 ) {
                    // game is giving us a dummy value for stuff like the clarabelle task, let's just
                    // make the percent 1 and move on
                    percent = 1;
                }
                document.getElementById("progress" + i).style.width = (100 * percent).toString() + "%"
                document.getElementById("bar" + i).style.display = "block";
                document.getElementById("progress-text" + i).textContent = progress;
            } else {
                document.getElementById("bar" + i).style.display = "none";
            }
            let reward_element = document.getElementById("reward" + i);
            let reward = test.getTaskReward(i);
            reward_element.style.fontSize = "38px";
            if (reward == null) text = "";
            else {
                text = "Reward: " + reward;
            }
            reward_element.textContent = text;
            // REALLY hacky but works. this shrinks the text until it isn't taking up two lines if it ever ends up taking two lines.
            if (reward_element.clientHeight > 47) { // one line at 38px font size is 47, anything above it takes up two lines
                for ( let i = 37; i > 0; i-- ) {
                    reward_element.style.fontSize = i + "px"
                    if (reward_element.clientHeight <= 47) {
                        break;
                    }
                }
            }
        }
    }
    setTimeout(update_data, timeout);
}

function hide_all_scrolls() {
    for ( let i = 0; i < 4; i++ ) {
        let element = document.getElementById("task" + i);
        if ( element == null ) {
            // the page we're on is missing this toontask
            continue;
        }
        element.style.display = "none";
    }
}

function setup_toontask_loop() {
    hide_all_scrolls();
    let token = localStorage.getItem(token_str);
    if (token == null) {
        // we have no token. we'll generate one.
        token = makeid(32);
        localStorage.setItem(token_str, token);
    }
    test = new ToonData(1547, token, user_agent);
    update_data();
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}