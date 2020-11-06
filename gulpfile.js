var fs = require('fs');
var gulp = require('gulp');
var glob = require('glob');
var shelljs = require('shelljs');
var path = require('path');
var branch = 'master';
var user = process.env.GIT_USER;
var token = process.env.GIT_TOKEN;
var user_mail = process.env.GIT_MAIL;
var is_temp = process.env.IS_TEMP;
var changedFileNames;
var changes;
/**
 * Source shipping to gitlab
 */
gulp.task('ship-to-gitlab', function (done) {
    changedFileNames = changedFileNameList();
    console.log('--changedFileNames----' + changedFileNames);
    var gitPath = 'https://' + user + ':' + token + `@gitlab.syncfusion.com/content/predictive-analytics-docs`;
    console.log('Clone has been started...!');
    var clone = shelljs.exec('git clone ' + gitPath + ' -b ' + branch + ' ' + `../../../gitlabRepo/predictive-analytics-docs`, {
        silent: false
    });
    if (clone.code !== 0) {
        console.log(clone.stderr);
        done();
        return;
    } else {
        console.log('Clone has been completed...!');
        // update src from github to gitlab - replace files from cloned repo

        for (var changedFileName of changedFileNames.split(',')) {

            if (changedFileName !== null && changedFileName !== '') {

                if (fs.existsSync('../predictive-analytics-docs/' + changedFileName)) {
                    // It will update the modified files
                    if (fs.existsSync('../../../gitlabRepo/predictive-analytics-docs/' + changedFileName)) {
                        shelljs.cp('-rf', `../predictive-analytics-docs/` + changedFileName, `../../../gitlabRepo/predictive-analytics-docs/` + changedFileName);
                    }
                    else {
                        // It will update the newly added files
                        if (fs.existsSync('../../../gitlabRepo/predictive-analytics-docs/')) {
                            shelljs.cp('-rf', `../predictive-analytics-docs/` + changedFileName, `../../../gitlabRepo/predictive-analytics-docs/` + changedFileName);
                        }
                    }

                }
                else {
                    // It will remove the deleted files
                    if (fs.existsSync('../../../gitlabRepo/predictive-analytics-docs/' + changedFileName)) {
                        shelljs.rm('-rf', `../../../gitlabRepo/predictive-analytics-docs/` + changedFileName);
                                               
                    }
                }

            }

        }

        shelljs.cd(`../../../gitlabRepo/predictive-analytics-docs`);
        shelljs.exec('git add .');
        shelljs.exec('git pull');
        shelljs.exec('git commit -m \"source updation from github repo \" --no-verify');
        shelljs.exec('git push');
        shelljs.cd('../../');
    }
})

// Controls List
function changedFileNameList() {
    shelljs.exec(`git config --global user.email "${user_mail}"`);
    shelljs.exec(`git config --global user.name "${user}"`);
    changes = shelljs.exec(`git diff --name-status HEAD^ HEAD`);
    var controls = '';
    var changesList = changes.stdout.split('\n');
    if (changesList !== null && changesList !== '') {
        for (var comp of changesList) {
            controls += comp.replace(/A\s+/g, "").replace(/M\s+/g, "").replace(/D\s+/g, "").replace(/R100\s+/g, "").split(/\s+/g) + ',';
        }
        return controls;
    }
}





