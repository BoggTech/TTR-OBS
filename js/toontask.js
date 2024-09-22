const timeout = 3000;
var test;
const token_str = "ttr-token"

function update_data() {
    test.updateData()
    .then(update_toontasks_and_loop)
    .catch((error) => {
        hide_all_scrolls();
        if (error.code == 403) {
            // hey :(...
            sessionStorage.removeItem(token_str);
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
            if (objective == "Visit") { // weird. but works. visit tasks only show as "visit"
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
            if ( progress ) {
                let current = test.getCurrentTaskProgress(i);
                let target = test.getCurrentTaskTarget(i);
                let percent = Math.max(0, Math.min(1, current/target))
                document.getElementById("progress" + i).style.width = (100 * percent).toString() + "%"
                document.getElementById("bar" + i).style.display = "block";
                document.getElementById("progress-text" + i).textContent = progress;
            } else {
                document.getElementById("bar" + i).style.display = "none";
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
    let token = sessionStorage.getItem(token_str);
    if (token == null) {
        // we have no token. we'll generate one.
        token = makeid(32);
        sessionStorage.setItem(token_str, token);
    }
    test = new ToonData(1547, token, "OBS Toon Overlay");
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