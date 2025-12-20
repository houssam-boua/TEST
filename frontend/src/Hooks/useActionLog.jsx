import React from "react";

/**
 * Converts an action log entry into a human-readable sentence.
 *
 * Example input:
 * {
 *   user_info: { first_name: "Admin", last_name: "User" },
 *   action: "create",
 *   target: { model: "document", doc_title: "Sample Doc" },
 *   timestamp: "2025-12-02T13:53:59.499940Z"
 * }
 *
 * Example output: "Admin User has created a new document named \"Sample Doc\""
 */
const useActionLog = (log) => {
  if (!log) return "";

  // Extract user name from user_info
  const userName = log.user_info
    ? `${log.user_info.first_name || ""} ${
        log.user_info.last_name || ""
      }`.trim()
    : "Unknown";

  const action = String(log.action || "").toLowerCase();
  const model = String(log.target?.model || "item").toLowerCase();
  const docTitle =
    log.extra_info?.doc_title ||
    log.target?.doc_title ||
    log.target?.repr ||
    "";

  // Map action types to past-tense verbs
  const getActionVerb = (actionType) => {
    const verbMap = {
      create: "created",
      edit: "edited",
      update: "updated",
      delete: "deleted",
      remove: "removed",
      approve: "approved",
      reject: "rejected",
      comment: "commented on",
      share: "shared",
      upload: "uploaded",
      download: "downloaded",
      view: "viewed",
      archive: "archived",
    };
    return verbMap[actionType] || `${actionType}d`;
  };

  // Determine article (a vs an)
  const getArticle = (word) => {
    const vowels = ["a", "e", "i", "o", "u"];
    return vowels.includes(word.toLowerCase().charAt(0)) ? "an" : "a";
  };

  const verb = getActionVerb(action);
  const article = getArticle(model);

  // Clean up title: remove quotes, filter out placeholders
  const cleanTitle = String(docTitle || "")
    .replace(/^["']|["']$/g, "")
    .trim();

  const isValidTitle =
    cleanTitle && !["(Unknown)", "Untitled", "-", ""].includes(cleanTitle);

  // Build the sentence
  let sentence = `${userName} has ${verb}`;

  // Add article + model for create/edit/delete; omit for comment/share/view
  if (!["comment", "share", "view", "download"].includes(action)) {
    sentence += ` ${article} new ${model}`;
  }

  // Append title if valid
  if (isValidTitle) {
    sentence += ` named "${cleanTitle}"`;
  }

  return sentence;
};

export default useActionLog;
