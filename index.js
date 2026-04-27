const IGNORED_ERRORS = [
    "Socket connection timeout",
    "EKEYTYPE",
    "item-not-found",
    "rate-overlimit",
    "Connection Closed",
    "Timed Out",
    "Value not found"
];

const FATAL_ERROR_KEYWORDS = [
    "Timed",
    "Error",
    "TypeError",
    "SessionError",
    "ENOENT",
    "ENOSPC",
    "Device logged out",
    "Connection Closed",
    "bad-request",
    "forbidden",
    "terminated",
    "defined",
    "undefined",
    "null",
    "Analysis.",
    "simultaneous",
    "all hosts"
];

const CONSOLE_FILTERS = {
    info: {
        ignore: [
            "Closing session:",
            "Opening session:",
            "Removing old closed session:",
            "Migrating session to:"
        ]
    },
    warn: {
        ignore: [
            "Closing stale",
            "Closing open session"
        ]
    },
    error: {
        ignore: [
            "Bad MAC",
            "Session error:"
        ],
        transform: (msg) => msg.includes("Failed to decrypt") && msg
    }
};

const containsAny = (str, patterns) => patterns.some(p => str.includes(p));

const getErrorMessage = (reason) => String(reason?.message || reason || "").trim();

const handleExit = (error, context) => {
    const message = getErrorMessage(error);

    if (containsAny(message, IGNORED_ERRORS)) return;
    if (!containsAny(message, FATAL_ERROR_KEYWORDS)) return;

    process.exit(1);
};

process.on("unhandledRejection", (reason) => {
    const message = getErrorMessage(reason);

    if (containsAny(message, IGNORED_ERRORS)) return;

    console.error("Unhandled Rejection:", reason);
    handleExit(reason, "unhandledRejection");
});

process.on("uncaughtException", (error) => {
    const message = getErrorMessage(error);

    if (message === "ENOMEM") {
        console.error("Out of memory, restarting...");
    } else {
        console.error("Uncaught Exception:", error);
    }

    handleExit(error, "uncaughtException");
});

process.on("warning", (warning) => {
    if (warning?.name === "MaxListenersExceededWarning") console.warn("Potential memory leak detected.");
});

const filterConsoleMethod = (method, {
    ignore = [],
    transform
} = {}) => {
    const original = console[method];

    console[method] = (...args) => {
        const first = args[0];
        const message = getErrorMessage(first);

        if (containsAny(message, IGNORED_ERRORS)) return;
        if (containsAny(message, ignore)) return;

        if (transform) {
            const result = transform(message, args);
            if (result === false) return;
            if (typeof result === "string") return original(result);
        }

        original(...args);
    };
};

Object.entries(CONSOLE_FILTERS).forEach(([method, config]) => {
    filterConsoleMethod(method, config);
});

const originalStderrWrite = process.stderr.write;
process.stderr.write = function(msg) {
    if (typeof msg === "string" && containsAny(msg, IGNORED_ERRORS)) return;
    return originalStderrWrite.apply(process.stderr, arguments);
};

const originalConsoleError = console.error;
console.error = function(msg, ...args) {
    if (typeof msg === "string" && containsAny(msg, IGNORED_ERRORS)) return;
    originalConsoleError.apply(console, [msg, ...args]);
};