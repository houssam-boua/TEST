import React from "react";
("use client");
import TextareaAutosize from "react-textarea-autosize";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
const CommentsInputGroup = () => {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <TextareaAutosize
          data-slot="input-group-control"
          className="flex field-sizing-content min-h-16 w-full resize-none rounded-t-md bg-white px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
          placeholder="Submit your comment..."
        />
        <InputGroupAddon align="block-end" className="bg-white rounded-b-md">
          <InputGroupButton className="ml-auto" size="sm" variant="default">
            Submit
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default CommentsInputGroup;
