// Technical fixture only. Domain events have no release story semantics.
EXTERNAL fixture_flag(id)
-> m1_fixture

=== m1_fixture ===
{fixture_flag("fixture.branch_enabled"):
    ข้อความทดสอบเริ่มต้น ไม่ใช่บทเกม # line:fixture_start_001 # speaker:none
- else:
    ข้อความทดสอบข้อมูลอีกสถานะ ไม่ใช่บทเกม # line:fixture_start_disabled_001 # speaker:none
}
# event:fixture.presentation.started
+ [เลือกเส้นทางทดสอบหนึ่ง # line:fixture_choice_a_001]
    -> fixture_a
+ [เลือกเส้นทางทดสอบสอง # line:fixture_choice_b_001]
    -> fixture_b

=== fixture_a ===
ข้อความจากเส้นทางทดสอบหนึ่ง # line:fixture_branch_a_001 # event:fixture.domain.branch_a
-> fixture_rejoin

=== fixture_b ===
ข้อความจากเส้นทางทดสอบสอง # line:fixture_branch_b_001 # event:fixture.domain.branch_b
-> fixture_rejoin

=== fixture_rejoin ===
# event:fixture.presentation.rejoined
{fixture_flag("fixture.branch_committed"):ข้อความทดสอบจุดกลับร่วม ยืนยันข้อมูลหลังบันทึก|ข้อมูลทดสอบยังไม่บันทึก} # line:fixture_rejoin_001
สิ้นสุดการทดสอบระบบ # line:fixture_end_001 # event:fixture.domain.rejoined
-> END
