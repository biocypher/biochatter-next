import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

import emojiRegex from "emoji-regex";


import { ModelType } from "../store";

import BotIcon from "../icons/biochatter.svg";
import BlackBotIcon from "../icons/biochatter.svg";


/**
 * emojiUnicode
 * Get the unicode code of an emoji in base 16.
 *
 * @name emojiUnicode
 * @function
 * @param {String} input The emoji character.
 * @returns {String} The base 16 unicode code.
 */

function emojiUnicode(input: string): string {
  return emojiUnicode.raw(input).split(' ').map(function (val) {
      return parseInt(val).toString(16);
  }).join('-');
}

/**
* emojiunicode.raw
* Get the unicode code points of an emoji in base 16.
*
* @name emojiunicode.raw
* @function
* @param {String} input The emoji character.
* @returns {String} The unicode code points.
*/
emojiUnicode.raw = function (input: string): string {
  if (input.length === 1) {
      return input.charCodeAt(0).toString();
  } else if (input.length > 1) {
      var pairs = [];
      for (var i = 0; i < input.length; i++) {
          if (
          // high surrogate
          input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff) {
              if (input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff) {
                  // low surrogate
                  pairs.push((input.charCodeAt(i) - 0xd800) * 0x400 + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000);
              }
          } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
              // modifiers and joiners
              pairs.push(input.charCodeAt(i));
          }
      }
      return pairs.join(' ');
  }

  return '';
};

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  // Whoever owns this Content Delivery Network (CDN), I am using your CDN to serve emojis
  // Old CDN broken, so I had to switch to this one
  // Author: https://github.com/H0llyW00dzZ
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function Avatar(props: { model?: ModelType; avatar?: string }) {
  if (props.model) {
    return (
      <div className="no-dark">
        {props.model?.startsWith("gpt-4") ? (
          <BlackBotIcon className="user-avatar" />
        ) : (
          <BotIcon className="user-avatar" />
        )}
      </div>
    );
  }

  const pat = emojiRegex();
  let avatar = props.avatar;
  if (avatar !== undefined && pat.test(avatar)) {
    avatar = emojiUnicode(avatar);
  }

  return (
    <div className="user-avatar">
      {avatar && <EmojiAvatar avatar={avatar} />}
    </div>
  );
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}