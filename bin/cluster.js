const cluster = require("cluster");
const os = require("os");

const CPUS = os.cpus();
if (cluster.isMaster) {
    CPUS.forEach(function() {
        cluster.fork()
    });
    cluster.on("listening", function(worker) {
        console.log("Cluster %d connected", worker.process.pid);
    });
    cluster.on("disconnect", function(worker) {
        console.log("Cluster %d disconnected", worker.process.pid);
    });
    cluster.on("exit", function(worker: cluster) {
        console.log("Cluster %d is dead", worker.process.pid);
        cluster.fork();
    });
} else {
    require("./www");
}
