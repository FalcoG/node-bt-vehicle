function getButtonName(ev) {
  if (ev.type === "AXIS") {
    switch (ev.number) {
      case 0:
        return "LEFT_STICK_X";
      case 1:
        return "LEFT_STICK_Y";
      case 2:
        return "RIGHT_STICK_X";
      case 3:
        return "RIGHT_STICK_Y";
      case 4:
        return "RIGHT_TRIGGER";
      case 5:
        return "LEFT_TRIGGER";
      case 6:
        return "DPAD_X";
      case 7:
        return "DPAD_Y";
    }
  }

  if (ev.type === "BUTTON") {
    switch (ev.number) {
      case 0:
        return "A";
      case 1:
        return "B";
      case 2:
        return "X";
      case 3:
        return "Y";
      case 4:
        return "LEFT_BUMPER";
      case 5:
        return "RIGHT_BUMPER";
      case 6:
        return "OPTIONS";
      case 7:
        return "MENU";
      case 8:
        return "STADIA";
      case 9:
        return "LEFT_STICK";
      case 10:
        return "RIGHT_STICK";
      case 11:
        return "ASSISTANT";
      case 12:
        return "CAPTURE";
      case 13:
        return "RIGHT_TRIGGER_PRESS";
      case 14:
        return "LEFT_TRIGGER_PRESS";
    }
  }
}

export function stadiaMapper(ev) {
  ev.name = getButtonName(ev);

  if (
    ev.name === "RIGHT_TRIGGER"
    || ev.name === "LEFT_TRIGGER"
  ) {
    ev.value += 32767;
  }

  return ev;
}
