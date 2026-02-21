from pydantic import ConfigDict


def to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0].lower() + "".join(p.title() for p in parts[1:])


model_config_camel = ConfigDict(
    from_attributes=True,
    populate_by_name=True,
    alias_generator=to_camel,
)
