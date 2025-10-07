$(document).ready(function () {
  $('#certificationProcessModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // 모달을 트리거한 버튼
    var modal = $(this);

    // 버튼의 data-* 속성에서 값 가져오기
    var certId = button.data('certification-id');
    var userId = button.data('user-id');
    var companyName = button.data('company-name');
    var requestDate = button.data('request-date');

    // 단일 문서 처리를 위한 수정
    var docName = button.data('document-name'); // 'data-document-name' 사용
    var docUrl = button.data('document-url'); // 'data-document-url' 사용

    // 모달 필드 값 설정
    modal.find('#modalCertificationId').val(certId);
    modal.find('#modalCertUserId').text(userId || '-');
    modal.find('#modalCertCompany').text(companyName || '-');
    modal.find('#modalCertRequestDate').text(requestDate || '-');

    // 모달 내 문서 표시 부분 수정
    var documentsContainer = modal.find('#modalCertDocuments');
    documentsContainer.empty(); // 이전 내용 비우기

    if (docUrl) {
      // 문서 URL이 있는 경우
      var documentHtml =
        '<div class="document-item">' +
        '<img src="' +
        docUrl +
        '" alt="' +
        (docName || '제출 서류') +
        '" data-toggle="modal" data-target="#imageZoomModal" data-zoom-image-url="' +
        docUrl +
        '">' +
        '<p>' +
        (docName || '제출 서류') +
        '</p>' +
        '</div>';
      documentsContainer.append(documentHtml);
    } else {
      // 문서 URL이 없는 경우
      documentsContainer.append(
        '<p class="text-muted" id="modalNoDocumentsMessage" style="width:100%; text-align:center;">제출된 서류가 없습니다.</p>'
      );
    }
  });

  // 이미지 확대 모달 관련 스크립트
  $('#imageZoomModal').on('show.bs.modal', function (event) {
    var triggerImage = $(event.relatedTarget); // 클릭된 이미지 (미리보기)
    $(this)
      .find('#zoomedImage')
      .attr('src', triggerImage.data('zoom-image-url'));
  });

  $('#imageZoomModal').on('hidden.bs.modal', function () {
    $(this).find('#zoomedImage').attr('src', ''); // 모달 닫힐 때 이미지 소스 초기화
  });
});

// 재직 인증 처리 함수 (인증/반려)
// 이 함수는 전역 스코프에 있거나, 또는 $(document).ready 내부에 정의하고
// HTML의 onclick에서 호출할 수 있도록 window 객체에 할당할 수도 있습니다.
// 여기서는 전역 스코프에 두는 것으로 가정합니다.
function handleCertificationAction(newStatus) {
  var certId = $('#modalCertificationId').val();
  var userId = $('#modalCertUserId').text();
  var companyName = $('#modalCertCompany').text();

  var confirmMessage =
    newStatus === 'APPROVED'
      ? '회원 ID: ' +
        userId +
        ' (회사: ' +
        companyName +
        ')\n재직 인증을 [승인] 처리하시겠습니까?'
      : '회원 ID: ' +
        userId +
        ' (회사: ' +
        companyName +
        ')\n재직 인증을 [반려] 처리하시겠습니까?';

  if (confirm(confirmMessage)) {
    // 사용자가 '확인'을 누르면
    var form = $('#certificationActionForm');
    form.find('#formCertificationId').val(certId);
    form.find('#formNewStatus').val(newStatus);

    form.submit();
  }
}
